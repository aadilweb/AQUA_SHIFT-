import pytest
from app.schemas.schemas import YieldPredictionRequest, SoilProfile, WeatherData, DailyWeatherForecast
from app.services.prediction_engine import predict_all_crops, predict_crop_performance


def test_crop_prediction_engine():
    """Verify FAO-56 crop yield and water requirements calculations."""
    pred_wheat = predict_crop_performance("WHEAT")
    assert pred_wheat.predicted_yield_tonnes_ha > 0.0
    assert pred_wheat.water_req_m3_ha > 0.0
    assert pred_wheat.estimated_revenue_inr_ha > pred_wheat.cultivation_cost_inr_ha

    pred_moong = predict_crop_performance("MOONG")
    # Moong (legume) should consume substantially less water than Paddy
    pred_paddy = predict_crop_performance("PADDY")
    assert pred_moong.water_req_m3_ha < pred_paddy.water_req_m3_ha * 0.30


def test_batch_prediction_service():
    """Verify batch prediction payload generation."""
    req = YieldPredictionRequest(
        latitude=30.2458,
        longitude=75.8421,
        crop_codes=["WHEAT", "PADDY", "MAIZE", "MOONG"]
    )
    res = predict_all_crops(req)
    assert len(res.predictions) == 4
    for p in res.predictions:
        assert p.confidence > 0.70
        assert p.suitability_score > 0.50
