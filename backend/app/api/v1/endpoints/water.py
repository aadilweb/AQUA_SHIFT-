from fastapi import APIRouter, Query
from app.schemas.schemas import GroundwaterStationInfo
from app.services.groundwater_service import get_groundwater_info

router = APIRouter()


@router.get("/groundwater", response_model=GroundwaterStationInfo)
async def get_groundwater_status(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0)
):
    """Retrieve nearest CGWB/NWIC groundwater telemetry station, water table depth (mbgl), and depletion status."""
    return get_groundwater_info(lat, lon)
