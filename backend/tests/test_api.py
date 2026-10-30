import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "AquaShift 2.0"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_crops_catalog_endpoint():
    response = client.get("/api/v1/crops")
    assert response.status_code == 200
    crops = response.json()
    assert len(crops) >= 8
    crop_codes = [c["code"] for c in crops]
    assert "PADDY" in crop_codes
    assert "WHEAT" in crop_codes
    assert "MOONG" in crop_codes


def test_market_prices_endpoint():
    response = client.get("/api/v1/market/prices")
    assert response.status_code == 200
    prices = response.json()
    assert len(prices) >= 8


def test_water_groundwater_endpoint():
    response = client.get("/api/v1/water/groundwater?lat=30.2458&lon=75.8421")
    assert response.status_code == 200
    data = response.json()
    assert "depth_mbgl" in data
    assert "classification" in data


def test_optimization_solve_endpoint():
    payload = {
        "total_land_ha": 20.0,
        "water_budget_m3": 120000.0,
        "food_target_tonnes": 30.0,
        "income_target_inr": 700000.0
    }
    response = client.post("/api/v1/optimization/solve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_land_ha"] == 20.0
    assert len(data["allocations"]) > 0

