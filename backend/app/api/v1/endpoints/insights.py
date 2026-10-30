from fastapi import APIRouter
from app.schemas.schemas import AIExplanationRequest, AIExplanationResponse
from app.services.ai_insights_engine import generate_agronomic_explanation

router = APIRouter()


@router.post("/explain", response_model=AIExplanationResponse)
async def explain_optimization_decision(request: AIExplanationRequest):
    """
    Generate an AI agronomic plain-language explanation of OR-Tools allocation results,
    tradeoffs, water savings, and constraint shortfalls without fabrication.
    """
    return generate_agronomic_explanation(request)
