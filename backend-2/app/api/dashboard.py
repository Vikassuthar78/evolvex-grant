from fastapi import APIRouter, HTTPException
from app.core.database import supabase
import re

router = APIRouter()


def _parse_amount(val) -> float:
    """Parse amount from either a number or string like '$50,000 - $200,000'."""
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        # Remove $ and commas, extract all numbers
        clean = val.replace('$', '').replace(',', '')
        nums = re.findall(r'[\d]+(?:\.[\d]+)?', clean)
        if nums:
            return max(float(n) for n in nums)
    return 0.0


@router.get("/dashboard/stats")
async def dashboard_stats(org_id: str = None):
    """
    Aggregated dashboard statistics pulling real data from grants,
    applications, and organizations tables.
    """
    try:
        # --- Grants ---
        grants_result = supabase.table("grants").select("id,fit_score,amount").execute()
        grants_data = grants_result.data or []
        total_grants = len(grants_data)

        fit_scores = [g["fit_score"] for g in grants_data if g.get("fit_score")]
        avg_fit = round(sum(fit_scores) / len(fit_scores), 1) if fit_scores else 0

        total_funding = sum(_parse_amount(g.get("amount", 0)) for g in grants_data)

        # --- Applications ---
        apps_query = supabase.table("applications").select("id,status,grant_id,compliance_score")
        if org_id:
            apps_query = apps_query.eq("org_id", org_id)
        apps_result = apps_query.execute()
        apps_data = apps_result.data or []

        pipeline = {"DRAFT": 0, "IN_REVIEW": 0, "APPROVED": 0, "SUBMITTED": 0}
        for app in apps_data:
            s = app.get("status", "DRAFT")
            if s in pipeline:
                pipeline[s] += 1

        total_apps = sum(pipeline.values())
        pending_reviews = pipeline.get("IN_REVIEW", 0)

        # --- Urgent deadlines (apps with their grant deadlines) ---
        urgent = []
        for app in apps_data[:10]:
            grant_id = app.get("grant_id")
            if grant_id:
                g = supabase.table("grants").select("title,funder,deadline").eq("id", grant_id).execute()
                if g.data:
                    urgent.append({
                        "id": app["id"],
                        "grantTitle": g.data[0].get("title", "Unknown Grant"),
                        "funder": g.data[0].get("funder", ""),
                        "deadline": g.data[0].get("deadline", ""),
                    })

        return {
            "success": True,
            "total_grants": total_grants,
            "avg_fit_score": avg_fit,
            "pending_reviews": pending_reviews,
            "total_funding": total_funding,
            "total_apps": total_apps,
            "pipeline": pipeline,
            "urgent_deadlines": urgent,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
