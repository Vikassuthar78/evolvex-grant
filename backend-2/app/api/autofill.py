from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from app.agents.pdf_parser import pdf_parser
from app.core.database import supabase

router = APIRouter()

class AutoFillRequest(BaseModel):
    org_id: str
    grant_id: Optional[str] = None
    pdf_url: Optional[str] = None

# ── Parse PDF from URL ──
@router.post("/autofill/parse-url")
async def parse_pdf_url(request: AutoFillRequest):
    try:
        if not request.pdf_url:
            raise HTTPException(status_code=400, detail="pdf_url is required")

        parsed = await pdf_parser.parse_from_url(request.pdf_url)
        return {"success": True, "parsed": parsed}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Upload and parse PDF ──
@router.post("/autofill/parse-upload")
async def parse_pdf_upload(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")

        pdf_bytes = await file.read()
        parsed = pdf_parser.parse_bytes(pdf_bytes)
        return {"success": True, "parsed": parsed}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Auto-fill parsed fields with org data ──
@router.post("/autofill/fill")
async def autofill_form(request: AutoFillRequest):
    try:
        # Get org profile
        org = supabase.table("organizations").select("*").eq("id", request.org_id).execute()
        if not org.data:
            raise HTTPException(status_code=404, detail="Org not found")

        org_data = org.data[0]

        # Parse PDF if URL provided
        parsed = {}
        if request.pdf_url:
            parsed = await pdf_parser.parse_from_url(request.pdf_url)

        fields = parsed.get("fields", [])

        # Map org data to form fields
        field_mapping = {
            "organization name": org_data.get("name", ""),
            "org name": org_data.get("name", ""),
            "mission statement": org_data.get("mission", ""),
            "mission": org_data.get("mission", ""),
            "location": org_data.get("location", ""),
            "team size": str(org_data.get("team_size", "")),
            "budget": str(org_data.get("budget", "")),
            "project description": org_data.get("past_projects", ""),
            "contact person": org_data.get("name", ""),
            "focus areas": ", ".join(org_data.get("focus_areas", [])),
        }

        # Fill each field
        filled_fields = []
        for field in fields:
            field_key = field["field_name"].lower().strip()
            filled_value = ""

            for key, value in field_mapping.items():
                if key in field_key or field_key in key:
                    filled_value = value
                    break

            filled_fields.append({
                **field,
                "filled_value": filled_value,
                "auto_filled": bool(filled_value),
                "needs_review": not bool(filled_value),
            })

        # Count stats
        auto_filled = sum(1 for f in filled_fields if f["auto_filled"])
        needs_review = sum(1 for f in filled_fields if f["needs_review"])

        return {
            "success": True,
            "org_name": org_data["name"],
            "total_fields": len(filled_fields),
            "auto_filled": auto_filled,
            "needs_review": needs_review,
            "fill_rate": f"{round(auto_filled/len(filled_fields)*100)}%" if filled_fields else "0%",
            "filled_fields": filled_fields,
            "word_limits": parsed.get("word_limits", {}),
            "eligibility": parsed.get("eligibility", ""),
            "deadline": parsed.get("deadline", ""),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Mock grant form for demo ──
@router.get("/autofill/mock-form/{org_id}")
async def get_mock_filled_form(org_id: str):
    try:
        # Get org profile
        org = supabase.table("organizations").select("*").eq("id", org_id).execute()
        if not org.data:
            raise HTTPException(status_code=404, detail="Org not found")

        org_data = org.data[0]

        # Simulate a real grant form with 15 fields
        mock_fields = [
            {"field_name": "Organization Name", "filled_value": org_data.get("name", ""), "auto_filled": True},
            {"field_name": "Mission Statement", "filled_value": org_data.get("mission", ""), "auto_filled": True},
            {"field_name": "Location", "filled_value": org_data.get("location", ""), "auto_filled": True},
            {"field_name": "Team Size", "filled_value": str(org_data.get("team_size", "")), "auto_filled": True},
            {"field_name": "Annual Budget", "filled_value": f"${org_data.get('budget', 0):,.0f}", "auto_filled": True},
            {"field_name": "Focus Areas", "filled_value": ", ".join(org_data.get("focus_areas", [])), "auto_filled": True},
            {"field_name": "Past Projects", "filled_value": org_data.get("past_projects", ""), "auto_filled": True},
            {"field_name": "Amount Requested", "filled_value": "", "auto_filled": False, "needs_review": True},
            {"field_name": "Project Title", "filled_value": "", "auto_filled": False, "needs_review": True},
            {"field_name": "Project Start Date", "filled_value": "", "auto_filled": False, "needs_review": True},
            {"field_name": "Project End Date", "filled_value": "", "auto_filled": False, "needs_review": True},
            {"field_name": "EIN / Tax ID", "filled_value": "", "auto_filled": False, "needs_review": True},
            {"field_name": "Contact Email", "filled_value": "", "auto_filled": False, "needs_review": True},
            {"field_name": "Contact Phone", "filled_value": "", "auto_filled": False, "needs_review": True},
            {"field_name": "Website", "filled_value": "", "auto_filled": False, "needs_review": True},
        ]

        auto_filled = sum(1 for f in mock_fields if f.get("auto_filled"))
        needs_review = sum(1 for f in mock_fields if not f.get("auto_filled"))

        return {
            "success": True,
            "org_name": org_data["name"],
            "total_fields": len(mock_fields),
            "auto_filled": auto_filled,
            "needs_review": needs_review,
            "fill_rate": f"{round(auto_filled/len(mock_fields)*100)}%",
            "filled_fields": mock_fields,
            "message": f"✅ Auto-filled {auto_filled}/15 fields from your knowledge base"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
     