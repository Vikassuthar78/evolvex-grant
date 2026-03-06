from fastapi import APIRouter, HTTPException
from app.models.schemas import OrgProfile
from app.core.database import supabase

router = APIRouter()

@router.post("/org/save")
async def save_org_profile(profile: OrgProfile):
    try:
        data = profile.model_dump()
        # Map extra fields into DB columns
        if data.get("country") and not data.get("location"):
            data["location"] = data["country"]
        if data.get("past_impact") and not data.get("past_projects"):
            data["past_projects"] = data["past_impact"]
        if data.get("funding_need") and not data.get("budget"):
            data["budget"] = data["funding_need"]
        # Only keep columns that exist in the DB table
        db_columns = {"name", "mission", "team_size", "focus_areas", "budget", "location", "past_projects"}
        db_data = {k: v for k, v in data.items() if k in db_columns and v is not None}
        result = supabase.table("organizations").insert(db_data).execute()
        return {"success": True, "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/org/all/list")
async def get_all_orgs():
    try:
        result = supabase.table("organizations").select("*").execute()
        return {"success": True, "orgs": result.data, "total": len(result.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/org/{org_id}")
async def get_org_profile(org_id: str):
    try:
        result = supabase.table("organizations").select("*").eq("id", org_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Org not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))