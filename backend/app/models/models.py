from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    district = Column(String(100), index=True)
    state = Column(String(100), index=True)
    country = Column(String(50), default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    agro_climatic_zone = Column(String(100), nullable=True)
    
    fields = relationship("Field", back_populates="region")


class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), default="Main Field")
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    area_hectares = Column(Float, nullable=False)
    area_acres = Column(Float, nullable=False)
    geometry_geojson = Column(Text, nullable=True)
    elevation_m = Column(Float, default=250.0)
    slope_deg = Column(Float, default=1.2)
    created_at = Column(DateTime, default=datetime.utcnow)

    region = relationship("Region", back_populates="fields")
    soil_observations = relationship("SoilObservation", back_populates="field")
    weather_observations = relationship("WeatherObservation", back_populates="field")


class SoilObservation(Base):
    __tablename__ = "soil_observations"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    texture = Column(String(50), default="Sandy Loam")
    ph = Column(Float, default=7.4)
    organic_carbon_pct = Column(Float, default=0.55)
    nitrogen_kg_ha = Column(Float, default=210.0)
    phosphorus_kg_ha = Column(Float, default=18.5)
    potassium_kg_ha = Column(Float, default=195.0)
    water_holding_capacity_pct = Column(Float, default=38.0)
    soil_moisture_pct = Column(Float, default=22.4)
    source = Column(String(100), default="SoilGrids / ICAR")
    confidence = Column(Float, default=0.88)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    field = relationship("Field", back_populates="soil_observations")


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    temperature_c = Column(Float, default=28.5)
    temp_min_c = Column(Float, default=21.0)
    temp_max_c = Column(Float, default=36.0)
    humidity_pct = Column(Float, default=55.0)
    wind_speed_kmh = Column(Float, default=12.4)
    precipitation_mm = Column(Float, default=1.2)
    et0_mm = Column(Float, default=5.4)
    aridity_index = Column(Float, default=0.28)
    heat_stress_level = Column(String(50), default="Moderate")
    drought_risk = Column(String(50), default="High")
    source = Column(String(100), default="Open-Meteo")
    recorded_at = Column(DateTime, default=datetime.utcnow)

    field = relationship("Field", back_populates="weather_observations")


class GroundwaterStation(Base):
    __tablename__ = "groundwater_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(50), unique=True, index=True)
    station_name = Column(String(100))
    district = Column(String(100), index=True)
    state = Column(String(100), index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    depth_mbgl = Column(Float, nullable=False) # Meters Below Ground Level
    historical_trend_slope = Column(Float, default=-0.45) # Negative indicates depleting
    classification = Column(String(50), default="Over-Exploited") # Safe, Semi-Critical, Critical, Over-Exploited
    source = Column(String(100), default="CGWB / NWIC")
    recorded_at = Column(DateTime, default=datetime.utcnow)


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    scientific_name = Column(String(100), nullable=True)
    category = Column(String(50), default="Cereal") # Cereal, Pulse, Oilseed, Cash Crop, Vegetable
    season = Column(String(50), default="Kharif") # Kharif, Rabi, Zaid, Annual
    base_yield_tonnes_ha = Column(Float, nullable=False)
    water_req_m3_ha = Column(Float, nullable=False)
    msp_price_per_tonne = Column(Float, nullable=False)
    avg_mandi_price_per_tonne = Column(Float, nullable=False)
    cultivation_cost_per_ha = Column(Float, nullable=False)
    calorie_density_kcal_kg = Column(Float, default=3200.0)
    drought_tolerance = Column(String(20), default="Medium") # Low, Medium, High
    suitability_score = Column(Float, default=0.85)


class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)
    run_timestamp = Column(DateTime, default=datetime.utcnow)
    scenario_name = Column(String(100), default="Baseline")
    total_land_ha = Column(Float, nullable=False)
    water_budget_m3 = Column(Float, nullable=False)
    food_target_tonnes = Column(Float, nullable=False)
    income_target_inr = Column(Float, nullable=False)
    
    # Solver outcomes
    status = Column(String(50), default="OPTIMAL")
    total_water_consumed = Column(Float, default=0.0)
    total_food_produced = Column(Float, default=0.0)
    total_farmer_income = Column(Float, default=0.0)
    
    # Shortfalls / Slack
    water_shortfall = Column(Float, default=0.0)
    food_shortfall = Column(Float, default=0.0)
    income_shortfall = Column(Float, default=0.0)
    bottleneck_constraint = Column(String(100), nullable=True)
    ai_explanation = Column(Text, nullable=True)

    allocations = relationship("CropAllocation", back_populates="run", cascade="all, delete-orphan")


class CropAllocation(Base):
    __tablename__ = "crop_allocations"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("optimization_runs.id"), nullable=False)
    crop_code = Column(String(50), nullable=False)
    crop_name = Column(String(100), nullable=False)
    allocated_area_ha = Column(Float, nullable=False)
    percentage_of_land = Column(Float, default=0.0)
    expected_yield_tonnes = Column(Float, default=0.0)
    expected_water_m3 = Column(Float, default=0.0)
    expected_net_income_inr = Column(Float, default=0.0)

    run = relationship("OptimizationRun", back_populates="allocations")
