from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.database import supabase
from app.core.config import settings

router = APIRouter()


class ReviewRequest(BaseModel):
    application_id: Optional[str] = None
    narrative: Optional[str] = None


@router.post("/review/simulate")
async def simulate_review(request: ReviewRequest):
    try:
        narrative = request.narrative or ""

        # If application_id provided, fetch narrative from DB
        if request.application_id and not narrative:
            try:
                app_result = supabase.table("applications").select("*").eq("id", request.application_id).execute()
                if app_result.data:
                    narrative = app_result.data[0].get("narrative", "")
            except Exception:
                pass  # UUID parse errors for mock IDs — continue with empty narrative

        # Use Groq to generate AI review if narrative exists and API key available
        if narrative and settings.GROQ_API_KEY:
            try:
                from groq import Groq
                client = Groq(api_key=settings.GROQ_API_KEY)
                prompt = f"""You are an expert NSF grant reviewer. Score this proposal narrative on 5 criteria.
For each section, provide a score (1-10), brief feedback, one strength, and one weakness.

NARRATIVE:
{narrative[:2000]}

Respond in this EXACT JSON format (no markdown, no code fences):
{{
  "overall_score": <sum of all scores>,
  "sections": [
    {{"section": "Problem Statement", "score": <1-10>, "max_score": 10, "feedback": "<1 sentence>", "strengths": ["<strength>"], "weaknesses": ["<weakness>"]}},
    {{"section": "Methodology", "score": <1-10>, "max_score": 10, "feedback": "<1 sentence>", "strengths": ["<strength>"], "weaknesses": ["<weakness>"]}},
    {{"section": "Impact & Outcomes", "score": <1-10>, "max_score": 10, "feedback": "<1 sentence>", "strengths": ["<strength>"], "weaknesses": ["<weakness>"]}},
    {{"section": "Budget Justification", "score": <1-10>, "max_score": 10, "feedback": "<1 sentence>", "strengths": ["<strength>"], "weaknesses": ["<weakness>"]}},
    {{"section": "Innovation & Novelty", "score": <1-10>, "max_score": 10, "feedback": "<1 sentence>", "strengths": ["<strength>"], "weaknesses": ["<weakness>"]}}
  ]
}}"""
                response = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=800,
                    temperature=0.3,
                )
                import json
                raw = response.choices[0].message.content.strip()
                # Strip markdown fences if present
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                return json.loads(raw)
            except Exception as e:
                print(f"Groq review error: {e}")

        # Fallback: rule-based scoring
        word_count = len(narrative.split()) if narrative else 0
        has_numbers = any(c.isdigit() for c in narrative) if narrative else False
        has_impact = any(w in narrative.lower() for w in ["impact", "outcome", "result", "benefit"]) if narrative else False

        base = 5
        if word_count > 200: base += 1
        if word_count > 400: base += 1
        if has_numbers: base += 1
        if has_impact: base += 1

        sections = [
            {"section": "Problem Statement", "score": min(base + 1, 10), "max_score": 10,
             "feedback": "Clear problem identification." if word_count > 100 else "Needs more detail.",
             "strengths": ["Addresses a real need"], "weaknesses": ["Could use more statistics"]},
            {"section": "Methodology", "score": min(base, 10), "max_score": 10,
             "feedback": "Approach is outlined." if word_count > 200 else "Methodology needs expansion.",
             "strengths": ["Structured approach"], "weaknesses": ["Timeline could be clearer"]},
            {"section": "Impact & Outcomes", "score": min(base + (1 if has_impact else 0), 10), "max_score": 10,
             "feedback": "Impact metrics included." if has_impact else "Missing measurable outcomes.",
             "strengths": ["Measurable goals"] if has_impact else ["Has potential"],
             "weaknesses": ["Long-term sustainability unclear"]},
            {"section": "Budget Justification", "score": min(base - 1, 10), "max_score": 10,
             "feedback": "Budget breakdown present." if has_numbers else "No budget details found.",
             "strengths": ["Reasonable allocation"], "weaknesses": ["Needs line-item detail"]},
            {"section": "Innovation & Novelty", "score": min(base, 10), "max_score": 10,
             "feedback": "Shows innovative elements.", "strengths": ["Fresh perspective"],
             "weaknesses": ["Differentiation from existing work unclear"]},
        ]

        overall = sum(s["score"] for s in sections)
        return {"overall_score": overall, "sections": sections}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
