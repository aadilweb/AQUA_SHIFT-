from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed baseline data
    try:
        init_db()
    except Exception as e:
        print(f"[AquaShift DB Init Error]: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AquaShift 2.0 — AI-Powered Geospatial Agricultural Intelligence & Crop Optimization Platform",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "platform": "AquaShift 2.0",
        "tagline": "Plan Crops. Balance Water. Protect Livelihoods.",
        "core_tenet": "Machine Learning predicts. Mathematical Optimization decides. Geospatial Intelligence contextualizes. AI explains.",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AquaShift Backend API"}
