import math
from typing import List, Dict, Any, Optional
from app.schemas.schemas import (
    OptimizationRequest,
    OptimizationResponse,
    AllocatedCropItem,
    OptimizationDiagnosis
)
from app.services.market_service import CROP_CATALOG
from app.services.prediction_engine import predict_crop_performance


def solve_crop_allocation(request: OptimizationRequest) -> OptimizationResponse:
    """
    Core Mathematical Optimization Engine.
    
    Formulates a multi-objective linear program with elastic slack variables
    to guarantee that an optimal or closest-feasible solution is always returned,
    even under severely conflicting resource constraints.
    
    Solver Hierarchy:
    1. Google OR-Tools (GLOP / SCIP) if available
    2. SciPy HiGHS Simplex / Dual Simplex LP Solver (Exact mathematical formulation)
    3. Knapsack Slack-Relaxed Heuristic
    """
    # 1. Resolve crop candidate set
    crop_pool: Dict[str, Dict[str, Any]] = {}
    if request.custom_crop_parameters:
        for c in request.custom_crop_parameters:
            crop_pool[c.code] = c.model_dump()
    elif request.selected_crop_codes:
        for code in request.selected_crop_codes:
            if code in CROP_CATALOG:
                crop_pool[code] = CROP_CATALOG[code]
    else:
        # Default diverse agricultural mix for target district
        crop_pool = {
            k: v for k, v in CROP_CATALOG.items()
            if k in ["PADDY", "WHEAT", "MAIZE", "COTTON", "MOONG", "MUSTARD", "TOMATO", "GROUNDNUT"]
        }

    crop_metrics: Dict[str, Dict[str, float]] = {}
    for code, info in crop_pool.items():
        pred = predict_crop_performance(code, request.soil_profile, request.weather_data)
        
        # Agronomic max single-crop acreage caps to ensure genuine agricultural diversification
        if code == "TOMATO":
            max_pct = 0.18 # High-perishable horticulture capped at 18% of land
        elif code in ["PADDY", "SUGARCANE"]:
            max_pct = 0.40 # Water-depleting crops capped at 40%
        else:
            max_pct = 0.45 # Cereals, pulses, oilseeds capped at 45% to guarantee multi-crop mix

        crop_metrics[code] = {
            "yield_ha": pred.predicted_yield_tonnes_ha,
            "water_ha": pred.water_req_m3_ha,
            "revenue_ha": pred.estimated_revenue_inr_ha,
            "cost_ha": pred.cultivation_cost_inr_ha,
            "net_income_ha": pred.estimated_net_income_inr_ha,
            "name": info.get("name", code),
            "category": info.get("category", "General"),
            "max_pct": max_pct
        }

    total_land = request.total_land_ha
    water_budget = request.water_budget_m3
    food_target = request.food_target_tonnes
    income_target = request.income_target_inr

    # Normalization baselines
    norm_water = max(1000.0, water_budget if water_budget > 0 else 50000.0)
    norm_food = max(1.0, food_target if food_target > 0 else 30.0)
    norm_income = max(10000.0, income_target if income_target > 0 else 500000.0)

    w_water_obj = request.weights.get("water", 1.0) if request.weights else 1.0
    w_food_slack = (request.weights.get("food", 2.0) if request.weights else 2.0) * 150.0
    w_income_slack = (request.weights.get("income", 2.0) if request.weights else 2.0) * 150.0
    w_water_slack = 300.0

    allocations: List[AllocatedCropItem] = []
    status_str = "OPTIMAL"
    water_shortfall = 0.0
    food_shortfall = 0.0
    income_shortfall = 0.0

    # Try Google OR-Tools first
    ortools_solved = False
    try:
        from ortools.linear_solver import pywraplp
        solver = pywraplp.Solver.CreateSolver("GLOP") or pywraplp.Solver.CreateSolver("SCIP")
        if solver:
            infinity = solver.infinity()
            x_vars = {}
            for code, m in crop_metrics.items():
                x_vars[code] = solver.NumVar(0.0, total_land * m["max_pct"], f"x_{code}")
            
            s_water = solver.NumVar(0.0, infinity, "slack_water")
            s_food = solver.NumVar(0.0, infinity, "slack_food")
            s_income = solver.NumVar(0.0, infinity, "slack_income")
            s_land = solver.NumVar(0.0, infinity, "slack_land")

            land_c = solver.Constraint(0.0, total_land)
            for code in crop_metrics:
                land_c.SetCoefficient(x_vars[code], 1.0)

            # Land Utilization (target at least 80% cultivated land with slack)
            min_land_c = solver.Constraint(0.80 * total_land, infinity)
            for code in crop_metrics:
                min_land_c.SetCoefficient(x_vars[code], 1.0)
            min_land_c.SetCoefficient(s_land, 1.0)

            water_c = solver.Constraint(-infinity, water_budget)
            for code, m in crop_metrics.items():
                water_c.SetCoefficient(x_vars[code], m["water_ha"])
            water_c.SetCoefficient(s_water, -1.0)

            food_c = solver.Constraint(food_target, infinity)
            for code, m in crop_metrics.items():
                if m["category"] != "Cash Crop":
                    food_c.SetCoefficient(x_vars[code], m["yield_ha"])
            food_c.SetCoefficient(s_food, 1.0)

            income_c = solver.Constraint(income_target, infinity)
            for code, m in crop_metrics.items():
                income_c.SetCoefficient(x_vars[code], m["net_income_ha"])
            income_c.SetCoefficient(s_income, 1.0)

            obj = solver.Objective()
            for code, m in crop_metrics.items():
                obj.SetCoefficient(x_vars[code], (w_water_obj * (m["water_ha"] / norm_water)) - (0.05 * (m["net_income_ha"] / norm_income)))
            obj.SetCoefficient(s_water, w_water_slack / norm_water)
            obj.SetCoefficient(s_food, w_food_slack / norm_food)
            obj.SetCoefficient(s_income, w_income_slack / norm_income)
            obj.SetCoefficient(s_land, 20.0 / total_land)
            obj.SetMinimization()

            res_code = solver.Solve()
            if res_code in [pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE]:
                water_shortfall = round(s_water.solution_value(), 2)
                food_shortfall = round(s_food.solution_value(), 2)
                income_shortfall = round(s_income.solution_value(), 2)
                status_str = "OPTIMAL"

                for code, m in crop_metrics.items():
                    val = round(x_vars[code].solution_value(), 2)
                    if val > 0.02:
                        allocations.append(create_alloc_item(code, m, val, total_land))
                ortools_solved = True
    except Exception:
        ortools_solved = False

    # If OR-Tools not active, use SciPy HiGHS LP Solver (Exact Simplex/Interior Point)
    if not ortools_solved:
        try:
            from scipy.optimize import linprog
            import numpy as np

            crop_codes = list(crop_metrics.keys())
            n_crops = len(crop_codes)
            
            c_vec = []
            bounds = []
            for code in crop_codes:
                m = crop_metrics[code]
                coef = (w_water_obj * (m["water_ha"] / norm_water)) - (0.05 * (m["net_income_ha"] / norm_income))
                c_vec.append(coef)
                bounds.append((0.0, total_land * m["max_pct"]))

            # Slack variables: s_water, s_food, s_income, s_land
            c_vec.extend([
                w_water_slack / norm_water,
                w_food_slack / norm_food,
                w_income_slack / norm_income,
                20.0 / total_land # Penalty for fallow land
            ])
            bounds.extend([(0.0, None), (0.0, None), (0.0, None), (0.0, None)])

            # Constraints A_ub @ z <= b_ub
            A_ub = []
            b_ub = []

            # 1. Total Land Conservation: sum(x_c) <= total_land
            row_land_max = [1.0] * n_crops + [0.0, 0.0, 0.0, 0.0]
            A_ub.append(row_land_max)
            b_ub.append(total_land)

            # 2. Land Utilization: -sum(x_c) - s_land <= -0.80 * total_land
            row_land_min = [-1.0] * n_crops + [0.0, 0.0, 0.0, -1.0]
            A_ub.append(row_land_min)
            b_ub.append(-0.80 * total_land)

            # 3. Water: sum(x_c * W_c) - s_water <= water_budget
            row_water = [crop_metrics[code]["water_ha"] for code in crop_codes] + [-1.0, 0.0, 0.0, 0.0]
            A_ub.append(row_water)
            b_ub.append(water_budget)

            # 4. Food: -sum(x_c * Y_c) - s_food <= -food_target
            row_food = [
                -crop_metrics[code]["yield_ha"] if crop_metrics[code]["category"] != "Cash Crop" else 0.0
                for code in crop_codes
            ] + [0.0, -1.0, 0.0, 0.0]
            A_ub.append(row_food)
            b_ub.append(-food_target)

            # 5. Income: -sum(x_c * I_c) - s_income <= -income_target
            row_income = [-crop_metrics[code]["net_income_ha"] for code in crop_codes] + [0.0, 0.0, -1.0, 0.0]
            A_ub.append(row_income)
            b_ub.append(-income_target)

            lp_res = linprog(c=c_vec, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")
            if lp_res.success:
                status_str = "OPTIMAL"
                x_vals = lp_res.x[:n_crops]
                s_vals = lp_res.x[n_crops:]
                water_shortfall = round(float(s_vals[0]), 2)
                food_shortfall = round(float(s_vals[1]), 2)
                income_shortfall = round(float(s_vals[2]), 2)

                for i, code in enumerate(crop_codes):
                    alloc_ha = round(float(x_vals[i]), 2)
                    if alloc_ha > 0.02:
                        allocations.append(create_alloc_item(code, crop_metrics[code], alloc_ha, total_land))
            else:
                allocations, water_shortfall, food_shortfall, income_shortfall = solve_heuristic_fallback(
                    total_land, water_budget, food_target, income_target, crop_metrics
                )
                status_str = "SLACK_RELAXED"
        except Exception:
            allocations, water_shortfall, food_shortfall, income_shortfall = solve_heuristic_fallback(
                total_land, water_budget, food_target, income_target, crop_metrics
            )
            status_str = "SLACK_RELAXED"

    tot_land_allocated = round(sum(a.allocated_ha for a in allocations), 2)
    tot_water_consumed = round(sum(a.expected_water_consumed_m3 for a in allocations), 1)
    tot_food_produced = round(sum(a.expected_yield_tonnes for a in allocations if a.category != "Cash Crop"), 2)
    tot_net_income = round(sum(a.expected_net_income_inr for a in allocations), 1)

    # Diagnosis and bottleneck isolation
    binding_constraints = []
    has_conflict = False
    diagnosis_explanation = "All environmental, food-production, and income targets were successfully satisfied."

    if water_shortfall > 10.0:
        has_conflict = True
        binding_constraints.append("WATER_BUDGET")
    if food_shortfall > 0.5:
        has_conflict = True
        binding_constraints.append("FOOD_PRODUCTION")
    if income_shortfall > 5000.0:
        has_conflict = True
        binding_constraints.append("FARMER_INCOME")

    if has_conflict:
        reasons = []
        if "WATER_BUDGET" in binding_constraints:
            reasons.append(f"Water consumption exceeds target ceiling by {water_shortfall:,.0f} m³.")
        if "FOOD_PRODUCTION" in binding_constraints:
            reasons.append(f"Food production falls short by {food_shortfall:,.1f} tonnes.")
        if "FARMER_INCOME" in binding_constraints:
            reasons.append(f"Farmer net income falls short of target by ₹{income_shortfall:,.0f}.")
        
        diagnosis_explanation = (
            f"Binding constraint conflict detected: {' '.join(reasons)} "
            "Elastic slack relaxation engaged to deliver the mathematically closest feasible allocation."
        )

    diagnosis = OptimizationDiagnosis(
        has_conflict=has_conflict,
        binding_constraints=binding_constraints,
        water_shortfall_m3=water_shortfall,
        food_shortfall_tonnes=food_shortfall,
        income_shortfall_inr=income_shortfall,
        explanation=diagnosis_explanation
    )

    water_savings = max(0.0, round(water_budget - tot_water_consumed, 1))

    return OptimizationResponse(
        scenario_name=request.scenario_name or "Custom",
        solver_status=status_str,
        is_feasible_as_requested=not has_conflict,
        total_land_ha=total_land,
        total_land_allocated_ha=tot_land_allocated,
        total_water_budget_m3=water_budget,
        total_water_consumed_m3=tot_water_consumed,
        total_food_target_tonnes=food_target,
        total_food_produced_tonnes=tot_food_produced,
        total_income_target_inr=income_target,
        total_farmer_net_income_inr=tot_net_income,
        water_savings_vs_budget_m3=water_savings,
        allocations=allocations,
        diagnosis=diagnosis
    )


def create_alloc_item(code: str, m: Dict[str, Any], alloc_ha: float, total_land: float) -> AllocatedCropItem:
    pct = round((alloc_ha / total_land) * 100.0, 1)
    exp_yield = round(alloc_ha * m["yield_ha"], 2)
    exp_water = round(alloc_ha * m["water_ha"], 1)
    exp_revenue = round(alloc_ha * m["revenue_ha"], 1)
    exp_cost = round(alloc_ha * m["cost_ha"], 1)
    exp_income = round(alloc_ha * m["net_income_ha"], 1)
    return AllocatedCropItem(
        crop_code=code,
        crop_name=m["name"],
        category=m["category"],
        allocated_ha=alloc_ha,
        percentage_of_land=pct,
        expected_yield_tonnes=exp_yield,
        expected_water_consumed_m3=exp_water,
        expected_net_income_inr=exp_income,
        revenue_inr=exp_revenue,
        cost_inr=exp_cost
    )


def solve_heuristic_fallback(total_land, water_budget, food_target, income_target, crop_metrics):
    ranked = sorted(
        crop_metrics.items(),
        key=lambda item: item[1]["net_income_ha"] / max(1.0, item[1]["water_ha"]),
        reverse=True
    )
    remaining_land = total_land
    remaining_water = water_budget
    allocations = []
    for code, m in ranked:
        if remaining_land <= 0:
            break
        max_alloc = min(remaining_land, total_land * m.get("max_pct", 0.40))
        water_allowance = remaining_water / max(1.0, m["water_ha"])
        alloc_ha = round(min(max_alloc, max(0.5, water_allowance)), 2)
        if alloc_ha > 0.1:
            remaining_land -= alloc_ha
            water_used = alloc_ha * m["water_ha"]
            remaining_water = max(0.0, remaining_water - water_used)
            allocations.append(create_alloc_item(code, m, alloc_ha, total_land))

    tot_food = sum(a.expected_yield_tonnes for a in allocations if a.category != "Cash Crop")
    tot_inc = sum(a.expected_net_income_inr for a in allocations)
    food_shortfall = max(0.0, round(food_target - tot_food, 2))
    income_shortfall = max(0.0, round(income_target - tot_inc, 1))
    water_shortfall = max(0.0, round(sum(a.expected_water_consumed_m3 for a in allocations) - water_budget, 1))
    return allocations, water_shortfall, food_shortfall, income_shortfall
