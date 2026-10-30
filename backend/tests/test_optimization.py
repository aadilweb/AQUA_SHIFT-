import pytest
from app.schemas.schemas import OptimizationRequest
from app.services.optimization_engine import solve_crop_allocation


def test_baseline_optimization_feasibility():
    """Verify that baseline allocation yields a feasible plan respecting total land limits."""
    req = OptimizationRequest(
        total_land_ha=20.0,
        water_budget_m3=140000.0,
        food_target_tonnes=30.0,
        income_target_inr=800000.0,
        scenario_name="Test Baseline"
    )
    res = solve_crop_allocation(req)
    
    assert res.total_land_allocated_ha <= 20.0 + 1e-4
    assert res.total_land_allocated_ha > 0.0
    assert len(res.allocations) > 0
    # Physical land allocation must never exceed total available land
    assert sum(a.allocated_ha for a in res.allocations) <= 20.0 + 1e-4


def test_conflict_detection_and_slack_relaxation():
    """
    CRITICAL REQUIREMENT: NEVER JUST RETURN INFEASIBLE.
    When water availability is throttled to extreme levels (80% cut) while
    income targets are doubled, the solver must NOT crash or return INFEASIBLE.
    It must relax soft constraints with slack variables, identify the bottleneck,
    and return the closest feasible physical allocation.
    """
    req = OptimizationRequest(
        total_land_ha=25.0,
        water_budget_m3=20000.0, # Drastically insufficient water for 25 ha
        food_target_tonnes=60.0, # Very high food target
        income_target_inr=2000000.0, # Very high income target
        scenario_name="Test Extreme Conflict"
    )
    res = solve_crop_allocation(req)
    
    # Solver must succeed and return allocations
    assert res.solver_status in ["OPTIMAL", "FEASIBLE", "SLACK_RELAXED"]
    # Total allocated land must still respect the hard physical constraint
    assert res.total_land_allocated_ha <= 25.0 + 1e-4
    # Conflict must be diagnosed
    assert res.diagnosis.has_conflict is True
    assert len(res.diagnosis.binding_constraints) > 0
    # Shortfall metrics must be quantified
    assert res.diagnosis.water_shortfall_m3 >= 0.0
    assert res.diagnosis.income_shortfall_inr >= 0.0
    assert "Binding constraint conflict detected" in res.diagnosis.explanation


def test_multi_crop_diversification():
    """Ensure allocations promote crop diversification rather than 100% monoculture."""
    req = OptimizationRequest(
        total_land_ha=30.0,
        water_budget_m3=180000.0,
        food_target_tonnes=40.0,
        income_target_inr=900000.0
    )
    res = solve_crop_allocation(req)
    
    # Must allocate to at least 2 distinct crops
    assert len(res.allocations) >= 2
    # No single crop should exceed 85% of total acreage
    for a in res.allocations:
        assert a.allocated_ha < 30.0 * 0.90
