from typing import List, Optional
from app.schemas.schemas import (
    OptimizationRequest,
    StressTestResponse,
    StressTestScenarioResult,
    SoilProfile,
    WeatherData
)
from app.services.optimization_engine import solve_crop_allocation


def run_all_stress_scenarios(
    total_land_ha: float = 20.0,
    base_water_budget_m3: float = 140000.0,
    base_food_target_tonnes: float = 35.0,
    base_income_target_inr: float = 850000.0,
    selected_crops: List[str] = None,
    soil_profile: Optional[SoilProfile] = None,
    weather_data: Optional[WeatherData] = None
) -> StressTestResponse:
    """
    Executes the 7 canonical stress test profiles sequentially,
    tracking crop mix mutations, shortfalls, and bottleneck constraints.
    """
    # 1. Baseline Scenario
    baseline_req = OptimizationRequest(
        total_land_ha=total_land_ha,
        water_budget_m3=base_water_budget_m3,
        food_target_tonnes=base_food_target_tonnes,
        income_target_inr=base_income_target_inr,
        selected_crop_codes=selected_crops,
        soil_profile=soil_profile,
        weather_data=weather_data,
        scenario_name="A. Baseline Scenario"
    )
    baseline_res = solve_crop_allocation(baseline_req)
    
    baseline_scenario = StressTestScenarioResult(
        scenario_id="baseline",
        scenario_name="A. Baseline Scenario",
        description="Standard historical water allocation and regional crop targets.",
        water_budget_m3=base_water_budget_m3,
        food_target_tonnes=base_food_target_tonnes,
        income_target_inr=base_income_target_inr,
        water_consumed_m3=baseline_res.total_water_consumed_m3,
        food_produced_tonnes=baseline_res.total_food_produced_tonnes,
        net_income_inr=baseline_res.total_farmer_net_income_inr,
        allocations=baseline_res.allocations,
        diagnosis=baseline_res.diagnosis
    )

    # 2. Predefined stress profiles
    profiles = [
        {
            "id": "mod_water_shortage",
            "name": "B. Moderate Water Shortage (-20%)",
            "description": "Irrigation water reduced by 20% due to delayed monsoon or canal cut.",
            "water": base_water_budget_m3 * 0.80,
            "food": base_food_target_tonnes,
            "income": base_income_target_inr
        },
        {
            "id": "sev_water_shortage",
            "name": "C. Severe Water Shortage (-50%)",
            "description": "Critical drought: 50% drop in irrigation water availability.",
            "water": base_water_budget_m3 * 0.50,
            "food": base_food_target_tonnes,
            "income": base_income_target_inr
        },
        {
            "id": "ext_water_shortage",
            "name": "D. Extreme Water Shortage (-80%)",
            "description": "Emergency aquifer overdraft restriction: 80% water reduction.",
            "water": base_water_budget_m3 * 0.20,
            "food": base_food_target_tonnes,
            "income": base_income_target_inr
        },
        {
            "id": "economic_stress",
            "name": "E. Economic Income Target Stress (+50%)",
            "description": "Farmer income target increased by 50% under baseline water.",
            "water": base_water_budget_m3,
            "food": base_food_target_tonnes,
            "income": base_income_target_inr * 1.50
        },
        {
            "id": "food_security_stress",
            "name": "F. Food Security Stress (+10% Food)",
            "description": "Regional food mandate requiring 10% higher grain production.",
            "water": base_water_budget_m3,
            "food": base_food_target_tonnes * 1.10,
            "income": base_income_target_inr
        },
        {
            "id": "combined_extreme",
            "name": "G. Combined Compound Stress",
            "description": "Water down 60%, Income target up 30%, Food target up 15%. Extreme stress test.",
            "water": base_water_budget_m3 * 0.40,
            "food": base_food_target_tonnes * 1.15,
            "income": base_income_target_inr * 1.30
        }
    ]

    scenarios_results: List[StressTestScenarioResult] = []
    for p in profiles:
        req = OptimizationRequest(
            total_land_ha=total_land_ha,
            water_budget_m3=p["water"],
            food_target_tonnes=p["food"],
            income_target_inr=p["income"],
            selected_crop_codes=selected_crops,
            soil_profile=soil_profile,
            weather_data=weather_data,
            scenario_name=p["name"]
        )
        res = solve_crop_allocation(req)
        scenarios_results.append(StressTestScenarioResult(
            scenario_id=p["id"],
            scenario_name=p["name"],
            description=p["description"],
            water_budget_m3=p["water"],
            food_target_tonnes=p["food"],
            income_target_inr=p["income"],
            water_consumed_m3=res.total_water_consumed_m3,
            food_produced_tonnes=res.total_food_produced_tonnes,
            net_income_inr=res.total_farmer_net_income_inr,
            allocations=res.allocations,
            diagnosis=res.diagnosis
        ))

    return StressTestResponse(
        baseline=baseline_scenario,
        scenarios=scenarios_results
    )
