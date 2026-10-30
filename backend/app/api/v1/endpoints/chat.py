from fastapi import APIRouter, Header, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.groq_service import get_groq_chat_response

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    groq_api_key: Optional[str] = None
    farm_context: Optional[Dict[str, Any]] = None
    model: Optional[str] = "llama-3.3-70b-versatile"

class ChatResponse(BaseModel):
    reply: str
    model: str
    is_fallback: bool
    usage: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/completions", response_model=ChatResponse)
async def chat_completions(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Multilingual Kisan AI Chatbot powered by Groq LLaMA-3.3.
    Understands voice/text in Hindi, Punjabi, Marathi, Telugu, English, etc.
    Provides real-time agro-climatic, groundwater, and crop optimization guidance.
    """
    # Extract API key from Authorization header if present and not in body
    api_key = request.groq_api_key
    if not api_key and authorization and authorization.startswith("Bearer "):
        api_key = authorization.replace("Bearer ", "").strip()

    messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
    
    result = await get_groq_chat_response(
        messages=messages_dict,
        api_key=api_key,
        farm_context=request.farm_context,
        model=request.model or "llama-3.3-70b-versatile"
    )
    
    return ChatResponse(
        reply=result["reply"],
        model=result.get("model", "llama-3.3-70b-versatile"),
        is_fallback=result.get("is_fallback", False),
        usage=result.get("usage"),
        error=result.get("error")
    )
