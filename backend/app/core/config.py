import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AquaShift 2.0 API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database (Default to SQLite for immediate local execution; Postgres/PostGIS ready)
    DATABASE_URL: str = "sqlite:///./aquashift.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # External APIs
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"
    USER_AGENT: str = "AquaShift-Geospatial-Platform/2.0"
    
    # Optional LLM & AI integrations
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
