from typing import List, Dict, Any
from app.schemas.schemas import MarketPriceInfo, CropDetail


# Master Crop Agronomic and Economic Parameters (Calibrated to Indian APMC / CACP data)
CROP_CATALOG: Dict[str, Dict[str, Any]] = {
    "PADDY": {
        "code": "PADDY",
        "name": "Paddy (Rice)",
        "category": "Cereal",
        "season": "Kharif",
        "base_yield_tonnes_ha": 4.5,
        "water_req_m3_ha": 12500.0, # High water intensity flood irrigation
        "msp_price_per_tonne": 23000.0,
        "avg_mandi_price_per_tonne": 24500.0,
        "cultivation_cost_per_ha": 48000.0,
        "calorie_density_kcal_kg": 3600.0,
        "drought_tolerance": "Low",
        "suitability_score": 0.85,
        "market_center": "Khanna / Sangrur APMC Mandi"
    },
    "WHEAT": {
        "code": "WHEAT",
        "name": "Wheat",
        "category": "Cereal",
        "season": "Rabi",
        "base_yield_tonnes_ha": 4.8,
        "water_req_m3_ha": 4500.0,
        "msp_price_per_tonne": 22750.0,
        "avg_mandi_price_per_tonne": 24200.0,
        "cultivation_cost_per_ha": 41000.0,
        "calorie_density_kcal_kg": 3400.0,
        "drought_tolerance": "Medium",
        "suitability_score": 0.90,
        "market_center": "Bathinda APMC Mandi"
    },
    "MAIZE": {
        "code": "MAIZE",
        "name": "Maize (Corn)",
        "category": "Cereal / Fodder",
        "season": "Kharif",
        "base_yield_tonnes_ha": 5.2,
        "water_req_m3_ha": 3500.0, # ~70% less water than paddy
        "msp_price_per_tonne": 20900.0,
        "avg_mandi_price_per_tonne": 22400.0,
        "cultivation_cost_per_ha": 34000.0,
        "calorie_density_kcal_kg": 3650.0,
        "drought_tolerance": "High",
        "suitability_score": 0.92,
        "market_center": "Hoshiarpur / Davanagere Mandi"
    },
    "COTTON": {
        "code": "COTTON",
        "name": "Bt Cotton",
        "category": "Cash Crop",
        "season": "Kharif",
        "base_yield_tonnes_ha": 2.2,
        "water_req_m3_ha": 6200.0,
        "msp_price_per_tonne": 71200.0,
        "avg_mandi_price_per_tonne": 74500.0,
        "cultivation_cost_per_ha": 52000.0,
        "calorie_density_kcal_kg": 0.0, # Non-food cash crop
        "drought_tolerance": "Medium",
        "suitability_score": 0.88,
        "market_center": "Mansa / Rajkot APMC"
    },
    "MOONG": {
        "code": "MOONG",
        "name": "Green Gram (Moong)",
        "category": "Pulse / Legume",
        "season": "Zaid / Kharif",
        "base_yield_tonnes_ha": 1.4,
        "water_req_m3_ha": 1800.0, # Ultra-low water, fixes atmospheric nitrogen
        "msp_price_per_tonne": 86800.0,
        "avg_mandi_price_per_tonne": 92000.0,
        "cultivation_cost_per_ha": 26000.0,
        "calorie_density_kcal_kg": 3470.0,
        "drought_tolerance": "High",
        "suitability_score": 0.95,
        "market_center": "Bikaner / Jalgaon APMC"
    },
    "CHICKPEA": {
        "code": "CHICKPEA",
        "name": "Chickpea (Gram)",
        "category": "Pulse / Legume",
        "season": "Rabi",
        "base_yield_tonnes_ha": 1.9,
        "water_req_m3_ha": 2200.0,
        "msp_price_per_tonne": 54400.0,
        "avg_mandi_price_per_tonne": 58500.0,
        "cultivation_cost_per_ha": 28000.0,
        "calorie_density_kcal_kg": 3640.0,
        "drought_tolerance": "High",
        "suitability_score": 0.91,
        "market_center": "Indore / Akola APMC"
    },
    "MUSTARD": {
        "code": "MUSTARD",
        "name": "Mustard / Rapeseed",
        "category": "Oilseed",
        "season": "Rabi",
        "base_yield_tonnes_ha": 2.1,
        "water_req_m3_ha": 2600.0,
        "msp_price_per_tonne": 56500.0,
        "avg_mandi_price_per_tonne": 60200.0,
        "cultivation_cost_per_ha": 27000.0,
        "calorie_density_kcal_kg": 5080.0,
        "drought_tolerance": "High",
        "suitability_score": 0.94,
        "market_center": "Alwar / Bharatpur Mandi"
    },
    "SUGARCANE": {
        "code": "SUGARCANE",
        "name": "Sugarcane",
        "category": "Cash Crop",
        "season": "Annual",
        "base_yield_tonnes_ha": 75.0,
        "water_req_m3_ha": 19500.0, # Massive water depletion
        "msp_price_per_tonne": 3400.0, # FRP
        "avg_mandi_price_per_tonne": 3550.0,
        "cultivation_cost_per_ha": 98000.0,
        "calorie_density_kcal_kg": 380.0,
        "drought_tolerance": "Low",
        "suitability_score": 0.70,
        "market_center": "Kolhapur / Muzaffarnagar Cooperative"
    },
    "GROUNDNUT": {
        "code": "GROUNDNUT",
        "name": "Groundnut (Peanut)",
        "category": "Oilseed",
        "season": "Kharif",
        "base_yield_tonnes_ha": 2.5,
        "water_req_m3_ha": 4200.0,
        "msp_price_per_tonne": 67800.0,
        "avg_mandi_price_per_tonne": 72500.0,
        "cultivation_cost_per_ha": 39000.0,
        "calorie_density_kcal_kg": 5670.0,
        "drought_tolerance": "Medium",
        "suitability_score": 0.89,
        "market_center": "Anantapur / Rajkot APMC"
    },
    "TOMATO": {
        "code": "TOMATO",
        "name": "High-Yield Tomato (Drip)",
        "category": "Horticulture",
        "season": "Rabi / Zaid",
        "base_yield_tonnes_ha": 28.0,
        "water_req_m3_ha": 3800.0, # Drip irrigation optimized
        "msp_price_per_tonne": 14000.0, # No MSP, market clearing price
        "avg_mandi_price_per_tonne": 18500.0,
        "cultivation_cost_per_ha": 82000.0,
        "calorie_density_kcal_kg": 180.0,
        "drought_tolerance": "Medium",
        "suitability_score": 0.86,
        "market_center": "Kolar / Nashik Pimpalgaon Mandi"
    }
}


def get_all_crops() -> List[CropDetail]:
    """Retrieve full catalog of calibrated crops."""
    results = []
    for c in CROP_CATALOG.values():
        results.append(CropDetail(**c))
    return results


def get_market_intelligence() -> List[MarketPriceInfo]:
    """Return Agmarknet mandi price and profitability benchmarks."""
    prices = []
    for code, c in CROP_CATALOG.items():
        modal_quintal = c["avg_mandi_price_per_tonne"] / 10.0
        msp_quintal = c["msp_price_per_tonne"] / 10.0
        gross_rev_ha = c["base_yield_tonnes_ha"] * c["avg_mandi_price_per_tonne"]
        net_profit_ha = gross_rev_ha - c["cultivation_cost_per_ha"]
        
        prices.append(MarketPriceInfo(
            crop_code=code,
            crop_name=c["name"],
            market_center=c["market_center"],
            state="All India APMC Composite",
            modal_price_per_quintal=round(modal_quintal, 1),
            msp_per_quintal=round(msp_quintal, 1),
            cultivation_cost_per_ha=c["cultivation_cost_per_ha"],
            estimated_net_profit_per_ha=round(net_profit_ha, 1),
            price_trend_7d="Upward" if code in ["MOONG", "MUSTARD"] else "Stable",
            source="Agmarknet & CACP Commission for Agricultural Costs and Prices"
        ))
    return prices
