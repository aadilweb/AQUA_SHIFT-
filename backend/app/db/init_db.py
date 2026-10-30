from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.models.models import Crop, GroundwaterStation
from app.services.market_service import CROP_CATALOG
from app.services.groundwater_service import CGWB_STATIONS


def init_db():
    """Create tables and seed initial agronomic catalog."""
    Base.metadata.create_all(bind=engine)
    
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        # Check if crops already seeded
        crop_count = db.query(Crop).count()
        if crop_count == 0:
            for code, c in CROP_CATALOG.items():
                crop_obj = Crop(
                    code=c["code"],
                    name=c["name"],
                    category=c["category"],
                    season=c["season"],
                    base_yield_tonnes_ha=c["base_yield_tonnes_ha"],
                    water_req_m3_ha=c["water_req_m3_ha"],
                    msp_price_per_tonne=c["msp_price_per_tonne"],
                    avg_mandi_price_per_tonne=c["avg_mandi_price_per_tonne"],
                    cultivation_cost_per_ha=c["cultivation_cost_per_ha"],
                    calorie_density_kcal_kg=c.get("calorie_density_kcal_kg", 3200.0),
                    drought_tolerance=c.get("drought_tolerance", "Medium"),
                    suitability_score=c.get("suitability_score", 0.90)
                )
                db.add(crop_obj)
            db.commit()

        # Seed groundwater stations
        gw_count = db.query(GroundwaterStation).count()
        if gw_count == 0:
            for st in CGWB_STATIONS:
                st_obj = GroundwaterStation(
                    station_code=st["station_code"],
                    station_name=st["station_name"],
                    district=st["district"],
                    state=st["state"],
                    latitude=st["latitude"],
                    longitude=st["longitude"],
                    depth_mbgl=st["depth_mbgl"],
                    historical_trend_slope=st["historical_trend_slope"],
                    classification=st["classification"],
                    source=st["source"]
                )
                db.add(st_obj)
            db.commit()
    finally:
        db.close()
