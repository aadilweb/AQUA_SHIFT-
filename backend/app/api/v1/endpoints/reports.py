from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from app.schemas.schemas import AIExplanationRequest
from app.services.ai_insights_engine import generate_agronomic_explanation

router = APIRouter()


@router.post("/generate", response_class=PlainTextResponse)
async def generate_markdown_report(request: AIExplanationRequest):
    """Generate and return full formatted agricultural audit report in GitHub Flavored Markdown."""
    explanation = generate_agronomic_explanation(request)
    return explanation.full_markdown_report
