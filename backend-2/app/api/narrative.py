from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.agents.narrator import NarratorAgent
from app.models.schemas import NarrativeRequest
from app.core.database import supabase

router = APIRouter()
narrator = NarratorAgent()

# ── Generate full narrative ──
@router.post("/narrative/generate")
async def generate_narrative(request: NarrativeRequest):
    try:
        result = narrator.generate(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Generate impact statement only ──
class ImpactRequest(BaseModel):
    org_mission: str
    focus_areas: List[str]

@router.post("/narrative/impact")
async def generate_impact(request: ImpactRequest):
    try:
        impact = narrator.generate_impact_statement(
            request.org_mission,
            request.focus_areas
        )
        return {"impact_statement": impact}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Generate budget justification ──
class BudgetRequest(BaseModel):
    budget: float
    project_description: str

@router.post("/narrative/budget")
async def generate_budget(request: BudgetRequest):
    try:
        justification = narrator.generate_budget_justification(
            request.budget,
            request.project_description
        )
        return {"budget_justification": justification}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Generate complete application package ──
class FullApplicationRequest(BaseModel):
    org_id: str
    grant_id: str
    grant_title: str
    funder_name: str
    funder_priorities: str

@router.post("/narrative/full-application")
async def generate_full_application(request: FullApplicationRequest):
    try:
        # Get org data
        org = supabase.table("organizations").select("*").eq("id", request.org_id).execute()
        if not org.data:
            raise HTTPException(status_code=404, detail="Org not found")

        org_data = org.data[0]
        mission = org_data.get("mission", "")
        focus_areas = org_data.get("focus_areas", [])
        budget = org_data.get("budget", 0)

        # Generate all 3 components
        narrative_req = NarrativeRequest(
            org_id=request.org_id,
            grant_id=request.grant_id,
            grant_title=request.grant_title,
            funder_name=request.funder_name,
            funder_priorities=request.funder_priorities,
            org_mission=mission,
            project_description=org_data.get("past_projects", "")
        )

        narrative = narrator.generate(narrative_req)
        impact = narrator.generate_impact_statement(mission, focus_areas)
        budget_just = narrator.generate_budget_justification(budget, org_data.get("past_projects", ""))

        # Save to applications table
        app_data = {
            "org_id": request.org_id,
            "grant_id": request.grant_id,
            "status": "draft",
            "narrative": narrative.essay,
            "form_data": {
                "impact_statement": impact,
                "budget_justification": budget_just,
                "funder_keywords_used": narrative.funder_keywords_used
            }
        }
        supabase.table("applications").insert(app_data).execute()

        return {
            "success": True,
            "org_name": org_data["name"],
            "grant_title": request.grant_title,
            "funder": request.funder_name,
            "narrative": narrative.essay,
            "word_count": narrative.word_count,
            "impact_statement": impact,
            "budget_justification": budget_just,
            "funder_keywords_used": narrative.funder_keywords_used,
            "status": "draft",
            "message": "✅ Full application package generated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))