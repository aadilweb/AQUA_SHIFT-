from typing import List
from fastapi import APIRouter
from app.schemas.schemas import MarketPriceInfo
from app.services.market_service import get_market_intelligence

router = APIRouter()


@router.get("/prices", response_model=List[MarketPriceInfo])
async def get_market_prices():
    """Retrieve Agmarknet wholesale APMC mandi prices, MSP, and production costs."""
    return get_market_intelligence()
