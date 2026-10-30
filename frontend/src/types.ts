export interface ReverseGeocodeResponse {
  latitude: number;
  longitude: number;
  village: string;
  district: string;
  state: string;
  country: string;
  formatted_address: string;
  agro_climatic_zone: string;
  elevation_m: number;
  source: string;
}

export interface DailyWeatherForecast {
  date: string;
  temp_min_c: number;
  temp_max_c: number;
  precipitation_mm: number;
  precipitation_probability_pct: number;
  et0_mm: number;
  condition: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature_c: number;
  temp_min_c: number;
  temp_max_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  et0_mm: number;
  aridity_index: number;
  heat_stress_level: string;
  drought_risk: string;
  rainfall_deficit_pct: number;
  daily_forecast: DailyWeatherForecast[];
  source: string;
  timestamp: string;
}

export interface SoilProfile {
  texture: string;
  ph: number;
  organic_carbon_pct: number;
  nitrogen_kg_ha: number;
  phosphorus_kg_ha: number;
  potassium_kg_ha: number;
  water_holding_capacity_pct: number;
  soil_moisture_pct: number;
  source: string;
  confidence: number;
  timestamp: string;
}

export interface GroundwaterStationInfo {
  station_code: string;
  station_name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  depth_mbgl: number;
  historical_trend_slope: number;
  classification: string;
  distance_km: number;
  source: string;
  timestamp: string;
}

export interface CropDetail {
  code: string;
  name: string;
  category: string;
  season: string;
  base_yield_tonnes_ha: number;
  water_req_m3_ha: number;
  msp_price_per_tonne: number;
  avg_mandi_price_per_tonne: number;
  cultivation_cost_per_ha: number;
  calorie_density_kcal_kg: number;
  drought_tolerance: string;
  suitability_score: number;
  market_center?: string;
}

export interface CropPredictionItem {
  crop_code: string;
  crop_name: string;
  category: string;
  predicted_yield_tonnes_ha: number;
  water_req_m3_ha: number;
  estimated_revenue_inr_ha: number;
  cultivation_cost_inr_ha: number;
  estimated_net_income_inr_ha: number;
  suitability_score: number;
  confidence: number;
  data_provenance: string;
}

export interface AllocatedCropItem {
  crop_code: string;
  crop_name: string;
  category: string;
  allocated_ha: number;
  percentage_of_land: number;
  expected_yield_tonnes: number;
  expected_water_consumed_m3: number;
  expected_net_income_inr: number;
  revenue_inr: number;
  cost_inr: number;
}

export interface OptimizationDiagnosis {
  has_conflict: boolean;
  binding_constraints: string[];
  water_shortfall_m3: number;
  food_shortfall_tonnes: number;
  income_shortfall_inr: number;
  explanation: string;
}

export interface OptimizationResponse {
  scenario_name: string;
  solver_status: string;
  is_feasible_as_requested: boolean;
  total_land_ha: number;
  total_land_allocated_ha: number;
  total_water_budget_m3: number;
  total_water_consumed_m3: number;
  total_food_target_tonnes: number;
  total_food_produced_tonnes: number;
  total_income_target_inr: number;
  total_farmer_net_income_inr: number;
  water_savings_vs_budget_m3: number;
  allocations: AllocatedCropItem[];
  diagnosis: OptimizationDiagnosis;
  ai_explanation?: string;
}

export interface StressTestScenarioResult {
  scenario_id: string;
  scenario_name: string;
  description: string;
  water_budget_m3: number;
  food_target_tonnes: number;
  income_target_inr: number;
  water_consumed_m3: number;
  food_produced_tonnes: number;
  net_income_inr: number;
  allocations: AllocatedCropItem[];
  diagnosis: OptimizationDiagnosis;
}

export interface StressTestResponse {
  baseline: StressTestScenarioResult;
  scenarios: StressTestScenarioResult[];
}

export interface AIExplanationResponse {
  scenario_name: string;
  executive_summary: string;
  crop_allocation_rationale: { crop: string; allocated_area: string; rationale: string }[];
  water_sustainability_assessment: string;
  financial_impact_and_risks: string;
  constraint_bottlenecks_and_recommendations: string;
  full_markdown_report: string;
}


export const DEFAULT_CROPS: CropDetail[] = [
  {"code": "PADDY", "name": "Paddy (Rice)", "category": "Cereal", "season": "Kharif", "base_yield_tonnes_ha": 4.5, "water_req_m3_ha": 12500.0, "msp_price_per_tonne": 23000.0, "avg_mandi_price_per_tonne": 24500.0, "cultivation_cost_per_ha": 48000.0, "calorie_density_kcal_kg": 3600.0, "drought_tolerance": "Low", "suitability_score": 0.85, "market_center": "Khanna / Sangrur APMC Mandi"},
  {"code": "WHEAT", "name": "Wheat", "category": "Cereal", "season": "Rabi", "base_yield_tonnes_ha": 4.8, "water_req_m3_ha": 4500.0, "msp_price_per_tonne": 22750.0, "avg_mandi_price_per_tonne": 24200.0, "cultivation_cost_per_ha": 41000.0, "calorie_density_kcal_kg": 3400.0, "drought_tolerance": "Medium", "suitability_score": 0.9, "market_center": "Bathinda APMC Mandi"},
  {"code": "MAIZE", "name": "Maize (Corn)", "category": "Cereal / Fodder", "season": "Kharif", "base_yield_tonnes_ha": 5.2, "water_req_m3_ha": 3500.0, "msp_price_per_tonne": 20900.0, "avg_mandi_price_per_tonne": 22400.0, "cultivation_cost_per_ha": 34000.0, "calorie_density_kcal_kg": 3650.0, "drought_tolerance": "High", "suitability_score": 0.92, "market_center": "Hoshiarpur / Davanagere Mandi"},
  {"code": "COTTON", "name": "Bt Cotton", "category": "Cash Crop", "season": "Kharif", "base_yield_tonnes_ha": 2.2, "water_req_m3_ha": 6200.0, "msp_price_per_tonne": 71200.0, "avg_mandi_price_per_tonne": 74500.0, "cultivation_cost_per_ha": 52000.0, "calorie_density_kcal_kg": 0.0, "drought_tolerance": "Medium", "suitability_score": 0.88, "market_center": "Mansa / Rajkot APMC"},
  {"code": "MOONG", "name": "Green Gram (Moong)", "category": "Pulse / Legume", "season": "Zaid / Kharif", "base_yield_tonnes_ha": 1.4, "water_req_m3_ha": 1800.0, "msp_price_per_tonne": 86800.0, "avg_mandi_price_per_tonne": 92000.0, "cultivation_cost_per_ha": 26000.0, "calorie_density_kcal_kg": 3470.0, "drought_tolerance": "High", "suitability_score": 0.95, "market_center": "Bikaner / Jalgaon APMC"},
  {"code": "CHICKPEA", "name": "Chickpea (Gram)", "category": "Pulse / Legume", "season": "Rabi", "base_yield_tonnes_ha": 1.9, "water_req_m3_ha": 2200.0, "msp_price_per_tonne": 54400.0, "avg_mandi_price_per_tonne": 58500.0, "cultivation_cost_per_ha": 28000.0, "calorie_density_kcal_kg": 3640.0, "drought_tolerance": "High", "suitability_score": 0.91, "market_center": "Indore / Akola APMC"},
  {"code": "MUSTARD", "name": "Mustard / Rapeseed", "category": "Oilseed", "season": "Rabi", "base_yield_tonnes_ha": 2.1, "water_req_m3_ha": 2600.0, "msp_price_per_tonne": 56500.0, "avg_mandi_price_per_tonne": 60200.0, "cultivation_cost_per_ha": 27000.0, "calorie_density_kcal_kg": 5080.0, "drought_tolerance": "High", "suitability_score": 0.94, "market_center": "Alwar / Bharatpur Mandi"},
  {"code": "SUGARCANE", "name": "Sugarcane", "category": "Cash Crop", "season": "Annual", "base_yield_tonnes_ha": 75.0, "water_req_m3_ha": 19500.0, "msp_price_per_tonne": 3400.0, "avg_mandi_price_per_tonne": 3550.0, "cultivation_cost_per_ha": 98000.0, "calorie_density_kcal_kg": 380.0, "drought_tolerance": "Low", "suitability_score": 0.7, "market_center": "Kolhapur / Muzaffarnagar Cooperative"},
  {"code": "GROUNDNUT", "name": "Groundnut (Peanut)", "category": "Oilseed", "season": "Kharif", "base_yield_tonnes_ha": 2.5, "water_req_m3_ha": 4200.0, "msp_price_per_tonne": 67800.0, "avg_mandi_price_per_tonne": 72500.0, "cultivation_cost_per_ha": 39000.0, "calorie_density_kcal_kg": 5670.0, "drought_tolerance": "Medium", "suitability_score": 0.89, "market_center": "Anantapur / Rajkot APMC"},
  {"code": "TOMATO", "name": "High-Yield Tomato (Drip)", "category": "Horticulture", "season": "Rabi / Zaid", "base_yield_tonnes_ha": 28.0, "water_req_m3_ha": 3800.0, "msp_price_per_tonne": 14000.0, "avg_mandi_price_per_tonne": 18500.0, "cultivation_cost_per_ha": 82000.0, "calorie_density_kcal_kg": 180.0, "drought_tolerance": "Medium", "suitability_score": 0.86, "market_center": "Kolar / Nashik Pimpalgaon Mandi"}
];


export const DEFAULT_OPTIMIZATION_RESULT: OptimizationResponse = {
  scenario_name: 'Scenario: baseline',
  solver_status: 'OPTIMAL',
  is_feasible_as_requested: true,
  total_land_ha: 25.0,
  total_land_allocated_ha: 20.0,
  total_water_budget_m3: 180000.0,
  total_water_consumed_m3: 48663.8,
  total_food_target_tonnes: 45.0,
  total_food_produced_tonnes: 135.07,
  total_income_target_inr: 1100000.0,
  total_farmer_net_income_inr: 3158336.5,
  water_savings_vs_budget_m3: 131336.2,
  allocations: [
    {
      crop_code: 'MOONG',
      crop_name: 'Green Gram (Moong)',
      category: 'Pulse / Legume',
      allocated_ha: 11.25,
      percentage_of_land: 45.0,
      expected_yield_tonnes: 14.74,
      expected_water_consumed_m3: 21480.8,
      expected_net_income_inr: 1063350.0,
      revenue_inr: 1355850.0,
      cost_inr: 292500.0
    },
    {
      crop_code: 'MUSTARD',
      crop_name: 'Mustard / Rapeseed',
      category: 'Oilseed',
      allocated_ha: 4.25,
      percentage_of_land: 17.0,
      expected_yield_tonnes: 8.46,
      expected_water_consumed_m3: 12066.6,
      expected_net_income_inr: 394391.5,
      revenue_inr: 509141.5,
      cost_inr: 114750.0
    },
    {
      crop_code: 'TOMATO',
      crop_name: 'High-Yield Tomato (Drip)',
      category: 'Horticulture',
      allocated_ha: 4.5,
      percentage_of_land: 18.0,
      expected_yield_tonnes: 111.87,
      expected_water_consumed_m3: 15116.4,
      expected_net_income_inr: 1700595.0,
      revenue_inr: 2069595.0,
      cost_inr: 369000.0
    }
  ],
  diagnosis: {
    has_conflict: false,
    binding_constraints: [],
    water_shortfall_m3: 0.0,
    food_shortfall_tonnes: 0.0,
    income_shortfall_inr: 0.0,
    explanation: 'All environmental, food-production, and income targets were successfully satisfied.'
  },
  ai_explanation: undefined
};

export const DEFAULT_PREDICTIONS: CropPredictionItem[] = DEFAULT_CROPS.map(c => {
  const rev = c.base_yield_tonnes_ha * c.avg_mandi_price_per_tonne;
  const net = rev - c.cultivation_cost_per_ha;
  return {
    crop_code: c.code,
    crop_name: c.name,
    category: c.category,
    predicted_yield_tonnes_ha: c.base_yield_tonnes_ha,
    water_req_m3_ha: c.water_req_m3_ha,
    estimated_revenue_inr_ha: rev,
    cultivation_cost_inr_ha: c.cultivation_cost_per_ha,
    estimated_net_income_inr_ha: net,
    suitability_score: c.suitability_score,
    confidence: 0.92,
    data_provenance: 'FAO-56 Penman-Monteith Crop Evapotranspiration + ICAR Yield Response'
  };
});
