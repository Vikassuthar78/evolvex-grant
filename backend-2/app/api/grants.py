from fastapi import APIRouter, HTTPException
from app.agents.discovery import DiscoveryAgent

router = APIRouter()
discovery_agent = DiscoveryAgent()

# Match grants to an org profile
@router.get("/grants/discover")
async def discover_grants(org_id: str, limit: int = 10):
    try:
        grants = await discovery_agent.find_matches(org_id, limit)
        return {"success": True, "grants": grants, "total": len(grants)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Search grants by keyword
@router.get("/grants/search")
async def search_grants(keyword: str, rows: int = 10):
    try:
        grants = await discovery_agent.search_grants(keyword, rows)
        return {"success": True, "grants": grants, "total": len(grants)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all grants from DB — score against org if org_id provided
@router.get("/grants/all")
async def get_all_grants(org_id: str = None):
    try:
        from app.core.database import supabase
        result = supabase.table("grants").select("*").execute()
        grants = result.data or []

        if org_id and grants:
            # Score each grant against the org profile
            org_result = supabase.table("organizations").select("*").eq("id", org_id).execute()
            if org_result.data:
                org_data = org_result.data[0]
                mission = org_data.get("mission", "")
                focus_areas = org_data.get("focus_areas", [])
                from app.core.embeddings import embedding_service
                grants = embedding_service.rank_grants(mission, focus_areas, grants)

        return {"success": True, "grants": grants, "total": len(grants)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Test embedding similarity
@router.get("/grants/test-embedding")
async def test_embedding(text_a: str, text_b: str):
    try:
        from app.core.embeddings import embedding_service
        score = embedding_service.similarity_score(text_a, text_b)
        return {
            "text_a": text_a,
            "text_b": text_b,
            "similarity_score": round(score * 100, 1),
            "interpretation": "high match" if score > 0.7 else "medium match" if score > 0.4 else "low match"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get single grant by ID — AFTER all fixed-path routes
@router.get("/grants/{grant_id}")
async def get_grant_by_id(grant_id: str):
    try:
        from app.core.database import supabase
        result = supabase.table("grants").select("*").eq("id", grant_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Grant not found")
        row = result.data[0]
        # Map DB fields to frontend-expected format
        fit = row.get("fit_score", 0) or 0
        row["fitScore"] = fit
        row["probabilityScore"] = round(fit * 0.85, 1)
        row["description"] = row.get("description", row.get("title", ""))
        row["status"] = "open"
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))