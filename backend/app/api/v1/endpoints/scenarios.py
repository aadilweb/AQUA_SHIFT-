from fastapi import APIRouter
from app.schemas.schemas import StressTestResponse, OptimizationRequest
from app.services.scenario_engine import run_all_stress_scenarios

router = APIRouter()


@router.post("/stress-test", response_model=StressTestResponse)
async def run_stress_test(request: OptimizationRequest):
    """
    Run 7 canonical stress test scenarios (Baseline, -20% Water, -50% Water, -80% Water,
    +50% Income target, +10% Food target, Combined extreme stress) and return comparative metrics.
    """
    return run_all_stress_scenarios(
        total_land_ha=request.total_land_ha,
        base_water_budget_m3=request.water_budget_m3,
        base_food_target_tonnes=request.food_target_tonnes,
        base_income_target_inr=request.income_target_inr,
        selected_crops=request.selected_crop_codes,
        soil_profile=request.soil_profile,
        weather_data=request.weather_data
    )
