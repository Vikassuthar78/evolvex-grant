from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.models.schemas import ComplianceRequest
from app.agents.compliance_guard import ComplianceGuard, compliance_guard
from app.core.database import supabase

router = APIRouter()
guard = ComplianceGuard()


class ComplianceCheckRequest(BaseModel):
    application_id: Optional[str] = None
    narrative: Optional[str] = None
    word_limit: Optional[int] = None
    eligibility_criteria: Optional[str] = None


@router.post("/compliance/check")
async def check_compliance(request: ComplianceCheckRequest):
    try:
        narrative = request.narrative or ""
        word_limit = request.word_limit
        eligibility_criteria = request.eligibility_criteria

        # If application_id provided, fetch narrative from DB
        if request.application_id and not narrative:
            app_result = supabase.table("applications").select("*").eq("id", request.application_id).execute()
            if app_result.data:
                app_data = app_result.data[0]
                narrative = app_data.get("narrative", "")
                if not narrative:
                    narrative = "Application narrative is empty."

        if not narrative:
            narrative = "No narrative provided for compliance check."

        req = ComplianceRequest(
            narrative=narrative,
            word_limit=word_limit,
            eligibility_criteria=eligibility_criteria
        )
        result = compliance_guard.validate(req)

        # Transform into structured items for the frontend
        items = []
        for i, issue in enumerate(result.issues):
            is_pass = issue.startswith("✅")
            items.append({
                "id": f"check-{i+1}",
                "category": "Content Quality" if i < 2 else "Compliance" if i < 4 else "Structure",
                "label": issue,
                "status": "pass" if is_pass else ("warning" if result.score >= 50 else "fail"),
                "message": issue,
                "suggestion": result.suggestions[i] if i < len(result.suggestions) else ""
            })

        # Ensure at least one item
        if not items:
            items.append({
                "id": "check-1",
                "category": "Overall",
                "label": "Compliance check complete",
                "status": "pass" if result.passed else "warning",
                "message": "No specific issues found" if result.passed else "Review needed",
                "suggestion": ""
            })

        return {
            "overall_score": result.score,
            "passed": result.passed,
            "items": items,
            "total_checks": len(items)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))