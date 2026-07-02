import httpx
import logging
from typing import Optional
from app.config.settings import settings

logger = logging.getLogger("campusai.gemini")

async def generate_gemini_content(prompt: str) -> str:
    """
    Sends a query to Google Gemini API (gemini-1.5-flash).
    If GEMINI_API_KEY is not defined, returns a mock simulated response.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is missing from configurations. Running in simulated reasoning mode.")
        
        # Smart simulation logic based on prompt keywords
        prompt_lower = prompt.lower()
        if "iit" in prompt_lower or "college" in prompt_lower:
            return (
                "Based on recent admission data, the institution has standard competitive eligibility requirements. "
                "Typically, a minimum 12th percentage of 75% (for IITs/NITs) or 50-60% for other state colleges is required, "
                "along with national/state entrance scores. Documents required include 10th/12th marksheets, JEE/entrance scorecards, "
                "category certificates, and transfer certificates. Fees range between 1.5 to 3 Lakhs per annum for premium branches."
            )
        elif "course" in prompt_lower or "b.tech" in prompt_lower or "mba" in prompt_lower:
            return (
                "The requested course has excellent prospective placement records across India. "
                "Curriculum emphasizes core fundamentals, lab work, and industry electives. "
                "Admissions are typically granted via competitive entrance examinations or merit listings."
            )
        else:
            return (
                "For comprehensive admissions, we recommend verifying specific parameters like seat allocations, "
                "latest state cut-offs, and detailed eligibility criteria directly on the respective college's official website."
            )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=25.0)
            if response.status_code == 200:
                result = response.json()
                # Parse gemini API payload structure
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                logger.error(f"Gemini API returned code {response.status_code}: {response.text}")
                return "Our reasoning module encountered an issue communicating with the AI server. Please try again shortly."
    except Exception as e:
        logger.error(f"Failed to query Gemini API: {e}")
        return "Our AI Counselor service is temporarily offline. Please verify network access and try again."
