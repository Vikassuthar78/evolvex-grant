from fastapi import APIRouter, HTTPException
from app.core.database import supabase
from app.core.embeddings import embedding_service
from app.agents.discovery import DiscoveryAgent

router = APIRouter()
discovery_agent = DiscoveryAgent()

# ── Full match: org profile → ranked grants ──
@router.get("/match/{org_id}")
async def match_grants(org_id: str, limit: int = 10):
    try:
        # Get org profile
        org = supabase.table("organizations").select("*").eq("id", org_id).execute()
        if not org.data:
            raise HTTPException(status_code=404, detail="Org not found")

        org_data = org.data[0]
        mission = org_data.get("mission", "")
        focus_areas = org_data.get("focus_areas", [])

        # Fetch + rank grants
        grants = await discovery_agent.find_matches(org_id, limit)

        # Add probability score
        for grant in grants:
            fit = grant.get("fit_score", 0)
            grant["probability_score"] = round(fit * 0.85, 1)
            grant["recommendation"] = (
                "⭐ Strong Match" if fit > 70 else
                "✅ Good Match" if fit > 50 else
                "🔍 Possible Match"
            )

        return {
            "success": True,
            "org_name": org_data.get("name"),
            "org_mission": mission,
            "total_matched": len(grants),
            "grants": grants
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Score a single grant against an org ──
@router.post("/match/score")
async def score_single(org_id: str, grant_id: str):
    try:
        org = supabase.table("organizations").select("*").eq("id", org_id).execute()
        grant = supabase.table("grants").select("*").eq("id", grant_id).execute()

        if not org.data or not grant.data:
            raise HTTPException(status_code=404, detail="Org or Grant not found")

        org_data = org.data[0]
        grant_data = grant.data[0]

        org_text = f"{org_data['mission']} {' '.join(org_data.get('focus_areas', []))}"
        grant_text = f"{grant_data['title']} {grant_data.get('eligibility', '')} {grant_data.get('keywords', '')}"

        score = embedding_service.similarity_score(org_text, grant_text)
        fit_score = round(score * 100, 1)

        return {
            "org": org_data["name"],
            "grant": grant_data["title"],
            "fit_score": fit_score,
            "probability_score": round(fit_score * 0.85, 1),
            "recommendation": (
                "⭐ Strong Match" if fit_score > 70 else
                "✅ Good Match" if fit_score > 50 else
                "🔍 Possible Match"
            )
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))