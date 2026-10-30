import os
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models"

CANDIDATE_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama-3.2-3b-preview",
    "llama-3.2-1b-preview",
    "gemma2-9b-it",
    "deepseek-r1-distill-llama-70b"
]

SYSTEM_PROMPT = """You are **Kisan AI Mitra (किसान एआई मित्र)**, the compassionate, multilingual AI Agricultural Advisor and Agronomist built into the AquaShift 2.0 platform.

### Your Core Mission:
You help Indian farmers transition from water-guzzling flood-paddy monoculture to climate-resilient, high-profit crop portfolios (like Green Gram/Moong, Mustard, Maize, Drip Tomatoes) that save groundwater from critical depletion while increasing farmer net income.

### Communication Guidelines:
1. **Multilingual Fluency**: Always detect the farmer's language (Hindi, Punjabi, English, Marathi, Telugu, Tamil, Gujarati, Bengali, etc.) and reply in that EXACT same language and script. If the farmer asks in Punjabi (Gurmukhi), reply warmly in Punjabi. If in Hindi (Devanagari), reply in Hindi. If in Hinglish/Punglish, match their comfortable conversational tone.
2. **Empathetic & Practical**: Speak with respect (use 'Aap', 'Tussi', 'Ji'). Explain technical concepts (ET0, mbgl water tables, soil moisture) in terms of real tubewell electricity bills, borewell drying risks, and mandi profits.
3. **Actionable Farm Knowledge**:
   - Provide concrete numbers: MSP rates, seeding rates (kg/acre), water requirements, sowing and harvesting windows.
   - Mention Indian Govt Schemes: PM-KUSUM (90% solar pump subsidy), PMKSY (Per Drop More Crop - 55% drip subsidy), Atal Bhujal Yojana, and MSP guarantees for pulses.
4. **Current Farm Context**:
   When available, explicitly reference the farmer's current live farm situation:
   {context_str}

Format responses with clean Markdown, bullet points, and highlight key figures clearly. Keep answers helpful and direct.
"""

def generate_local_farmer_response(user_message: str, farm_context: Optional[Dict[str, Any]] = None) -> str:
    """Intelligent rule-based fallback when Groq API key is not yet set or unavailable."""
    msg = user_message.lower()
    loc = farm_context.get("location", "Punjab/Haryana Plains") if farm_context else "Punjab"
    land = farm_context.get("total_land_ha", 25.0) if farm_context else 25.0
    water = farm_context.get("water_budget_m3", 180000.0) if farm_context else 180000.0

    if any(w in msg for w in ["paddy", "dhan", "rice", "ਝੋਨਾ", "धान"]):
        return f"""🌾 **Paddy Water Conservation Advisory / धान जल संरक्षण परामर्श**:
In **{loc}**, traditional flood paddy consumes ~12,500 m³ of water per hectare, which over-extracts local aquifers by 3 to 4 times the annual recharge rate.

**AquaShift Recommended Solution**:
1. **Diversify to Green Gram (Moong)**: Consumes only 1,800 m³/ha (saves 85% water!) and fixes 40 kg/ha atmospheric nitrogen.
2. **Adopt DSR (Direct Seeded Rice)**: If growing rice, DSR saves 25-30% irrigation water and reduces labor costs by ₹4,000/acre.
3. **Shift to Kharif Maize**: Yields ₹45,000+/ha net profit while using 70% less water than flood paddy.

*(💡 To activate live AI voice analysis with Groq, verify your key has active models enabled in console.groq.com)*"""

    elif any(w in msg for w in ["subsidy", "yojana", "scheme", "सब्सीडी", "ਸਬਸਿਡੀ", "योजना"]):
        return f"""🚜 **Government Subsidies & Support Schemes for {loc}**:
1. **PM-KUSUM Yojana**: Up to **60% - 90% subsidy** on solar water pumps for irrigation, freeing you from diesel bills.
2. **PMKSY (Per Drop More Crop)**: **55% subsidy** for small/marginal farmers for micro-irrigation (Drip & Sprinkler).
3. **Sub-Mission on Agricultural Mechanization (SMAM)**: 50% subsidy on seed drills, happy seeders, and mulchers.
4. **MSP Guarantee for Pulses**: Green Gram (Moong) MSP is set at ₹8,682/quintal with assured procurement."""

    elif any(w in msg for w in ["profit", "income", "money", "ਕਮਾਈ", "मुनाफा", "पैसा"]):
        return f"""💰 **Farm Net Profit Potential (Across your {land} Hectares)**:
By shifting from pure Paddy monoculture to an **AquaShift Optimized Portfolio** (Moong + Mustard + Maize + Drip Tomato):
* **Estimated Seasonal Net Income**: **₹28 - ₹34 Lakhs** (₹1.2 - ₹1.5 Lakhs per hectare).
* **Groundwater Saved**: Over **130,000 m³**, preventing your borewells from running dry in the next 3 seasons.
* **Fertilizer Savings**: ₹3,500/ha saved on Urea thanks to legume bio-fixation."""

    return f"""🙏 **Namaste! Sat Sri Akal! (नमस्ते / ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ)**
I am **Kisan AI Mitra**, your agricultural advisor for **{loc}** ({land} ha farm, current water budget: {water:,.0f} m³).

I can help you with:
* 💧 **Water Budgeting**: Save borewells while sustaining high-yield harvest.
* 🌾 **Crop Transitioning**: Compare Moong, Mustard, Maize, Cotton vs Paddy.
* 🚜 **Govt Subsidies**: PM-KUSUM, PMKSY Drip subsidies, and mandi MSP rates.
* 🌧️ **Weather & Soil Advice**: Optimal sowing dates and irrigation schedules.

*Please ask your question in any language (Hindi, Punjabi, English, etc.) using your keyboard or microphone!*"""


async def fetch_accessible_models(api_key: str) -> List[str]:
    """Dynamically query Groq API to get the exact list of models available to this specific API key."""
    if not api_key:
        return CANDIDATE_MODELS
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                GROQ_MODELS_URL,
                headers={"Authorization": f"Bearer {api_key.strip()}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                active = [
                    m["id"] for m in data.get("data", [])
                    if m.get("active", True) and not m["id"].startswith("whisper")
                ]
                if active:
                    return active
    except Exception as e:
        print(f"[Groq Models Fetch Warning]: {e}")
    return CANDIDATE_MODELS


async def get_groq_chat_response(
    messages: List[Dict[str, str]],
    api_key: Optional[str] = None,
    farm_context: Optional[Dict[str, Any]] = None,
    model: str = "llama-3.3-70b-versatile"
) -> Dict[str, Any]:
    """Call Groq API with robust multi-model fallback and contextual error recovery."""
    key_to_use = api_key or settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")

    # If no key is provided, return structured local agricultural response
    if not key_to_use or key_to_use.strip() == "":
        last_user_msg = messages[-1]["content"] if messages else ""
        return {
            "reply": generate_local_farmer_response(last_user_msg, farm_context),
            "model": "AquaShift Local Kisan Engine",
            "is_fallback": True,
            "message": "Groq API key not set. Using built-in Kisan Ag-Tech Knowledge Base."
        }

    # Format farm context string
    context_str = "No specific farm context provided."
    if farm_context:
        context_str = f"""
- Location: {farm_context.get('location', 'Sangrur, Punjab')}
- Farm Land: {farm_context.get('total_land_ha', 25.0)} hectares ({round(farm_context.get('total_land_ha', 25.0) * 2.471, 1)} acres)
- Available Water Budget: {farm_context.get('water_budget_m3', 180000):,.0f} m³
- Groundwater Depth: {farm_context.get('groundwater_depth_mbgl', '34.6')} meters below ground (Critical/Overdrawn)
- Recommended Crops: {farm_context.get('recommended_crops', 'Green Gram (Moong), Mustard, Drip Tomato')}
- Expected Net Profit: ₹{farm_context.get('estimated_profit_inr', '3,158,336')}
- Weather: {farm_context.get('weather_summary', 'Sunny, 28°C, ET0 4.2 mm/day')}
"""

    sys_message = {
        "role": "system",
        "content": SYSTEM_PROMPT.format(context_str=context_str)
    }

    groq_messages = [sys_message] + messages

    # Fetch models accessible to this key
    accessible_models = await fetch_accessible_models(key_to_use)

    # Models to try in order of preference
    models_to_try = [model] if model in accessible_models else []
    for m in accessible_models:
        if m not in models_to_try:
            models_to_try.append(m)
    for m in CANDIDATE_MODELS:
        if m not in models_to_try:
            models_to_try.append(m)

    headers = {
        "Authorization": f"Bearer {key_to_use.strip()}",
        "Content-Type": "application/json"
    }

    last_error = ""

    async with httpx.AsyncClient(timeout=20.0) as client:
        for candidate in models_to_try:
            try:
                payload = {
                    "model": candidate,
                    "messages": groq_messages,
                    "temperature": 0.65,
                    "max_tokens": 1200
                }
                resp = await client.post(GROQ_API_URL, json=payload, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    reply_text = data["choices"][0]["message"]["content"]
                    return {
                        "reply": reply_text,
                        "model": data.get("model", candidate),
                        "is_fallback": False,
                        "usage": data.get("usage", {})
                    }
                
                resp_json = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                err_code = resp_json.get("error", {}).get("code", "")
                err_msg = resp_json.get("error", {}).get("message", resp.text)
                last_error = err_msg

                # If model is decommissioned or not found, try next candidate model
                if resp.status_code in (400, 404) and ("model" in err_code or "model" in err_msg.lower()):
                    continue
                else:
                    break
            except Exception as e:
                last_error = str(e)
                continue

    # Graceful recovery if all models fail (e.g. key has restricted permissions or network issue)
    last_user_msg = messages[-1]["content"] if messages else ""
    return {
        "reply": generate_local_farmer_response(last_user_msg, farm_context),
        "model": "AquaShift Kisan Engine (Fallback)",
        "is_fallback": True,
        "error": f"Groq Note: {last_error}"
    }
