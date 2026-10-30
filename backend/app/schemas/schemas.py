from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# Geospatial Schemas
class GeoLocation(BaseModel):
    latitude: float
    longitude: float


class ReverseGeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    village: Optional[str] = "Unknown Village"
    district: str
    state: str
    country: str = "India"
    formatted_address: str
    agro_climatic_zone: str
    elevation_m: float
    source: str = "OpenStreetMap Nominatim & ICAR"


class FieldPolygon(BaseModel):
    name: Optional[str] = "Selected Agricultural Plot"
    coordinates: List[List[float]] # List of [longitude, latitude] pairs forming closed polygon
    elevation_m: Optional[float] = 250.0
    slope_deg: Optional[float] = 1.2


class FieldResponse(BaseModel):
    id: Optional[int] = 1
    name: str
    area_hectares: float
    area_acres: float
    geometry_geojson: Dict[str, Any]
    elevation_m: float
    slope_deg: float


# Soil Schemas
class SoilProfile(BaseModel):
    texture: str
    ph: float
    organic_carbon_pct: float
    nitrogen_kg_ha: float
    phosphorus_kg_ha: float
    potassium_kg_ha: float
    water_holding_capacity_pct: float
    soil_moisture_pct: float
    source: str
    confidence: float
    timestamp: str


# Weather Schemas
class DailyWeatherForecast(BaseModel):
    date: str
    temp_min_c: float
    temp_max_c: float
    precipitation_mm: float
    precipitation_probability_pct: float
    et0_mm: float
    condition: str


class WeatherData(BaseModel):
    latitude: float
    longitude: float
    temperature_c: float
    temp_min_c: float
    temp_max_c: float
    humidity_pct: float
    wind_speed_kmh: float
    precipitation_mm: float
    et0_mm: float # Reference Evapotranspiration
    aridity_index: float
    heat_stress_level: str
    drought_risk: str
    rainfall_deficit_pct: float
    daily_forecast: List[DailyWeatherForecast]
    source: str
    timestamp: str


# Groundwater Schemas
class GroundwaterStationInfo(BaseModel):
    station_code: str
    station_name: str
    district: str
    state: str
    latitude: float
    longitude: float
    depth_mbgl: float
    historical_trend_slope: float # negative = dropping water table
    classification: str # Safe, Semi-Critical, Critical, Over-Exploited
    distance_km: float
    source: str
    timestamp: str


# Market & Crop Schemas
class CropDetail(BaseModel):
    code: str
    name: str
    category: str
    season: str
    base_yield_tonnes_ha: float
    water_req_m3_ha: float
    msp_price_per_tonne: float
    avg_mandi_price_per_tonne: float
    cultivation_cost_per_ha: float
    calorie_density_kcal_kg: float
    drought_tolerance: str
    suitability_score: float
    min_allocation_ha: Optional[float] = 0.0
    max_allocation_ha: Optional[float] = None


class MarketPriceInfo(BaseModel):
    crop_code: str
    crop_name: str
    market_center: str
    state: str
    modal_price_per_quintal: float
    msp_per_quintal: float
    cultivation_cost_per_ha: float
    estimated_net_profit_per_ha: float
    price_trend_7d: str # Upward, Stable, Downward
    source: str


# Machine Learning Prediction Schemas
class YieldPredictionRequest(BaseModel):
    latitude: float
    longitude: float
    crop_codes: Optional[List[str]] = None
    soil_profile: Optional[SoilProfile] = None
    weather_data: Optional[WeatherData] = None


class CropPredictionItem(BaseModel):
    crop_code: str
    crop_name: str
    category: str
    predicted_yield_tonnes_ha: float
    water_req_m3_ha: float
    estimated_revenue_inr_ha: float
    cultivation_cost_inr_ha: float
    estimated_net_income_inr_ha: float
    suitability_score: float
    confidence: float
    data_provenance: str


class YieldPredictionResponse(BaseModel):
    predictions: List[CropPredictionItem]
    model_name: str
    feature_provenance: Dict[str, str]


# Optimization Engine Schemas
class OptimizationRequest(BaseModel):
    total_land_ha: float = Field(..., gt=0, description="Total field area in hectares")
    water_budget_m3: float = Field(..., ge=0, description="Available irrigation water budget in cubic meters")
    food_target_tonnes: float = Field(..., ge=0, description="Minimum food production target in metric tonnes")
    income_target_inr: float = Field(..., ge=0, description="Minimum farmer net income target in INR")
    selected_crop_codes: Optional[List[str]] = None
    custom_crop_parameters: Optional[List[CropDetail]] = None
    soil_profile: Optional[SoilProfile] = None
    weather_data: Optional[WeatherData] = None
    weights: Optional[Dict[str, float]] = Field(
        default={"water": 1.0, "food": 2.0, "income": 2.0, "diversification": 0.5},
        description="Multi-objective normalization weights"
    )
    scenario_name: Optional[str] = "Custom"


class AllocatedCropItem(BaseModel):
    crop_code: str
    crop_name: str
    category: str
    allocated_ha: float
    percentage_of_land: float
    expected_yield_tonnes: float
    expected_water_consumed_m3: float
    expected_net_income_inr: float
    revenue_inr: float
    cost_inr: float


class OptimizationDiagnosis(BaseModel):
    has_conflict: bool
    binding_constraints: List[str]
    water_shortfall_m3: float
    food_shortfall_tonnes: float
    income_shortfall_inr: float
    explanation: str


class OptimizationResponse(BaseModel):
    scenario_name: str
    solver_status: str
    is_feasible_as_requested: bool
    total_land_ha: float
    total_land_allocated_ha: float
    total_water_budget_m3: float
    total_water_consumed_m3: float
    total_food_target_tonnes: float
    total_food_produced_tonnes: float
    total_income_target_inr: float
    total_farmer_net_income_inr: float
    water_savings_vs_budget_m3: float
    allocations: List[AllocatedCropItem]
    diagnosis: OptimizationDiagnosis
    ai_explanation: Optional[str] = None


# Stress Testing Schemas
class StressTestScenarioResult(BaseModel):
    scenario_id: str
    scenario_name: str
    description: str
    water_budget_m3: float
    food_target_tonnes: float
    income_target_inr: float
    water_consumed_m3: float
    food_produced_tonnes: float
    net_income_inr: float
    allocations: List[AllocatedCropItem]
    diagnosis: OptimizationDiagnosis


class StressTestResponse(BaseModel):
    baseline: StressTestScenarioResult
    scenarios: List[StressTestScenarioResult]


# AI Agronomic Explanation Schemas
class AIExplanationRequest(BaseModel):
    scenario_name: str
    location_summary: str
    optimization_result: OptimizationResponse
    groundwater_context: Optional[str] = None
    soil_context: Optional[str] = None
    weather_context: Optional[str] = None


class AIExplanationResponse(BaseModel):
    scenario_name: str
    executive_summary: str
    crop_allocation_rationale: List[Dict[str, str]]
    water_sustainability_assessment: str
    financial_impact_and_risks: str
    constraint_bottlenecks_and_recommendations: str
    full_markdown_report: str
