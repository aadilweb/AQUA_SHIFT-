from fastapi import APIRouter, Query
from app.schemas.schemas import SoilProfile
from app.services.soil_service import get_soil_profile

router = APIRouter()


@router.get("/profile", response_model=SoilProfile)
async def get_soil_data(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0)
):
    """Retrieve soil chemical properties (pH, OC, NPK) and hydrological characteristics (WHC, moisture)."""
    return await get_soil_profile(lat, lon)
