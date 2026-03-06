"""
Admin API — Backend endpoints for admin panel
Provides aggregate data views for admin dashboard, orgs, grants, apps, audit logs
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.database import supabase

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", summary="Admin dashboard statistics")
async def admin_stats():
    """Aggregate stats for admin dashboard."""
    try:
        orgs = supabase.table("organizations").select("id", count="exact").execute()
        grants_res = supabase.table("grants").select("id", count="exact").execute()
        apps = supabase.table("applications").select("id, status", count="exact").execute()
        audit = supabase.table("audit_log").select("id", count="exact").execute()

        # Count apps by status
        status_counts = {}
        for app in (apps.data or []):
            s = app.get("status", "unknown").upper()
            status_counts[s] = status_counts.get(s, 0) + 1

        # Count today's audit actions
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        today_audit = supabase.table("audit_log").select("action").gte("created_at", f"{today}T00:00:00").execute()
        narratives_today = sum(1 for a in (today_audit.data or []) if "NARRATIVE" in (a.get("action", "").upper()))
        compliance_today = sum(1 for a in (today_audit.data or []) if "COMPLIANCE" in (a.get("action", "").upper()))

        return {
            "success": True,
            "total_organizations": orgs.count or len(orgs.data or []),
            "total_grants": grants_res.count or len(grants_res.data or []),
            "total_applications": apps.count or len(apps.data or []),
            "application_status": status_counts,
            "narratives_today": narratives_today,
            "compliance_today": compliance_today,
            "total_audit_entries": audit.count or len(audit.data or []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organizations", summary="List all organizations")
async def list_organizations(limit: int = 50):
    """List all organizations for admin view."""
    try:
        result = supabase.table("organizations").select("*").order("created_at", desc=True).limit(limit).execute()

        # Count applications per org
        orgs = []
        for org_data in (result.data or []):
            app_count = supabase.table("applications").select("id", count="exact").eq("org_id", org_data["id"]).execute()
            orgs.append({
                **org_data,
                "application_count": app_count.count or len(app_count.data or [])
            })

        return {"success": True, "organizations": orgs, "total": len(orgs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organizations/{org_id}", summary="Get organization details")
async def get_organization(org_id: str):
    """Get detailed org info with their applications."""
    try:
        org = supabase.table("organizations").select("*").eq("id", org_id).execute()
        if not org.data:
            raise HTTPException(status_code=404, detail="Organization not found")

        apps = supabase.table("applications").select("*").eq("org_id", org_id).order("created_at", desc=True).execute()

        return {
            "success": True,
            "organization": org.data[0],
            "applications": apps.data or []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/grants", summary="List all grants for admin")
async def list_grants(limit: int = 100, source: str = "db"):
    """List grants. source=db for database, source=live for Grants.gov."""
    try:
        if source == "live":
            from app.agents.discovery import DiscoveryAgent
            agent = DiscoveryAgent()
            # Fetch popular categories from Grants.gov
            all_grants = []
            for kw in ["technology", "health", "education", "environment", "business"]:
                fetched = await agent.fetch_from_grants_gov(kw, rows=10)
                all_grants.extend(fetched)
            # Deduplicate by title
            seen = set()
            unique = []
            for g in all_grants:
                if g["title"] and g["title"] not in seen:
                    seen.add(g["title"])
                    unique.append(g)
            return {"success": True, "grants": unique[:limit], "total": len(unique[:limit]), "source": "grants.gov"}

        result = supabase.table("grants").select("*").order("created_at", desc=True).limit(limit).execute()
        return {"success": True, "grants": result.data or [], "total": len(result.data or []), "source": "database"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/grants", summary="Add a new grant")
async def add_grant(payload: dict):
    """Add a new grant to the database."""
    import uuid
    from datetime import datetime, timezone
    try:
        grant_id = str(uuid.uuid4())
        record = {
            "id": grant_id,
            "title": payload.get("title", ""),
            "funder": payload.get("funder", ""),
            "amount": payload.get("amount", 0),
            "description": payload.get("description", ""),
            "category": payload.get("category", ""),
            "keywords": payload.get("keywords", []),
            "eligibility": payload.get("eligibility", ""),
            "fit_score": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        result = supabase.table("grants").insert(record).execute()
        return {"success": True, "grant": result.data[0] if result.data else record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/grants/{grant_id}", summary="Update a grant")
async def update_grant(grant_id: str, payload: dict):
    """Update grant fields."""
    try:
        updates = {k: v for k, v in payload.items() if k not in ("id", "created_at") and v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        result = supabase.table("grants").update(updates).eq("id", grant_id).execute()
        return {"success": True, "grant": result.data[0] if result.data else {}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/grants/{grant_id}", summary="Delete a grant")
async def delete_grant(grant_id: str):
    """Delete a grant."""
    try:
        supabase.table("grants").delete().eq("id", grant_id).execute()
        return {"success": True, "message": f"Grant {grant_id} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/applications", summary="List all applications across all orgs")
async def list_applications(status: Optional[str] = None, limit: int = 100):
    """List all applications for admin monitoring."""
    try:
        query = supabase.table("applications").select("*")
        if status:
            query = query.eq("status", status.lower())
        result = query.order("created_at", desc=True).limit(limit).execute()

        # Enrich with org name and grant title
        enriched = []
        for app in (result.data or []):
            org_name = ""
            grant_title = ""
            try:
                org_res = supabase.table("organizations").select("name").eq("id", app.get("org_id", "")).execute()
                if org_res.data:
                    org_name = org_res.data[0].get("name", "")
            except Exception:
                pass
            try:
                grant_res = supabase.table("grants").select("title").eq("id", app.get("grant_id", "")).execute()
                if grant_res.data:
                    grant_title = grant_res.data[0].get("title", "")
            except Exception:
                pass
            enriched.append({**app, "org_name": org_name, "grant_title": grant_title})

        return {"success": True, "applications": enriched, "total": len(enriched)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit", summary="Get audit log entries")
async def get_audit_log(limit: int = 100):
    """Fetch audit log for admin view."""
    try:
        result = supabase.table("audit_log").select("*").order("created_at", desc=True).limit(limit).execute()
        return {"success": True, "entries": result.data or [], "total": len(result.data or [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profiles", summary="List all user profiles")
async def list_profiles(limit: int = 100):
    """List all profiles for admin view."""
    try:
        result = supabase.table("profiles").select("*").order("created_at", desc=True).limit(limit).execute()
        return {"success": True, "profiles": result.data or [], "total": len(result.data or [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health", summary="System health check")
async def system_health():
    """Check if all major systems are operational."""
    checks = {}

    # DB check
    try:
        supabase.table("organizations").select("id").limit(1).execute()
        checks["database"] = "healthy"
    except Exception:
        checks["database"] = "error"

    # Groq check
    try:
        from app.core.config import settings
        checks["groq_configured"] = bool(settings.GROQ_API_KEY)
    except Exception:
        checks["groq_configured"] = False

    checks["api"] = "healthy"

    return {
        "success": True,
        "status": "healthy" if checks.get("database") == "healthy" else "degraded",
        "checks": checks
    }


@router.post("/setup-profiles", summary="Create profiles table if not exists")
async def setup_profiles():
    """Ensure profiles table exists with required columns."""
    try:
        sql = """
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY,
            email TEXT,
            role TEXT DEFAULT 'founder',
            org_id TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
        supabase.rpc("exec_sql", {"query": sql}).execute()
        return {"success": True, "message": "Profiles table ready"}
    except Exception:
        # Table may already exist — try adding org_id column
        try:
            supabase.rpc("exec_sql", {"query": "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS org_id TEXT;"}).execute()
            return {"success": True, "message": "org_id column added to profiles"}
        except Exception:
            # If RPC not available, just confirm the table works
            try:
                supabase.table("profiles").select("id").limit(1).execute()
                return {"success": True, "message": "Profiles table exists (org_id column may need manual addition)"}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
