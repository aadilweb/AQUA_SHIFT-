from typing import List
from fastapi import APIRouter
from app.schemas.schemas import CropDetail
from app.services.market_service import get_all_crops

router = APIRouter()


@router.get("", response_model=List[CropDetail])
async def list_crops():
    """Retrieve full catalog of calibrated crops with water requirements, yield, and economic baselines."""
    return get_all_crops()
