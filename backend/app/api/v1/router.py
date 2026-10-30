from fastapi import APIRouter
from app.api.v1.endpoints import (
    geo,
    weather,
    soil,
    water,
    market,
    crops,
    predictions,
    optimization,
    scenarios,
    insights,
    reports,
    chat
)

api_router = APIRouter()

api_router.include_router(geo.router, prefix="/geo", tags=["Geospatial"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(soil.router, prefix="/soil", tags=["Soil"])
api_router.include_router(water.router, prefix="/water", tags=["Groundwater"])
api_router.include_router(market.router, prefix="/market", tags=["Market & Mandi"])
api_router.include_router(crops.router, prefix="/crops", tags=["Crop Catalog"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["ML Predictions"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["OR-Tools Optimization"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenario Stress Testing"])
api_router.include_router(insights.router, prefix="/insights", tags=["AI Explanation Engine"])
api_router.include_router(reports.router, prefix="/reports", tags=["Audit Reports"])
api_router.include_router(chat.router, prefix="/chat", tags=["Kisan AI Chatbot"])
