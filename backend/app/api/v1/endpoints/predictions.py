from fastapi import APIRouter
from app.schemas.schemas import YieldPredictionRequest, YieldPredictionResponse
from app.services.prediction_engine import predict_all_crops

router = APIRouter()


@router.post("/yield", response_model=YieldPredictionResponse)
async def predict_yield_and_water(request: YieldPredictionRequest):
    """
    Predict crop-wise yields, water requirements (m³/ha), and expected net returns
    using FAO-56 crop coefficient response models based on local soil and weather.
    """
    return predict_all_crops(request)
