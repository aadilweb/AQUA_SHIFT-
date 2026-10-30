from fastapi import APIRouter, Query
from app.schemas.schemas import WeatherData
from app.services.weather_service import get_weather

router = APIRouter()


@router.get("/current", response_model=WeatherData)
async def get_current_weather(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0)
):
    """Retrieve real-time meteorological conditions, reference ET0, and agricultural drought indices."""
    return await get_weather(lat, lon)


@router.get("/forecast", response_model=WeatherData)
async def get_weather_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0)
):
    """Retrieve 7-day agricultural weather forecast with precipitation probabilities and ET0."""
    return await get_weather(lat, lon)
