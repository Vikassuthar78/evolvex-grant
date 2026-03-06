"""
B-12: Application State API
Manages full grant application lifecycle:
DRAFT → IN_REVIEW → APPROVED → SUBMITTED
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import smtplib
import io
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders

from app.core.database import supabase

router = APIRouter(prefix="/api/applications", tags=["Applications"])

# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────

VALID_STATUSES = ["DRAFT", "IN_REVIEW", "APPROVED", "SUBMITTED"]

STATUS_TRANSITIONS = {
    "DRAFT":     ["IN_REVIEW"],
    "IN_REVIEW": ["APPROVED", "DRAFT"],   # can push back to DRAFT
    "APPROVED":  ["SUBMITTED", "IN_REVIEW"],
    "SUBMITTED": []                        # terminal state
}

class ApplicationCreate(BaseModel):
    org_id: str
    grant_id: str
    narrative: Optional[str] = None
    form_data: Optional[dict] = None
    compliance_score: Optional[float] = None

class ApplicationUpdate(BaseModel):
    narrative: Optional[str] = None
    form_data: Optional[dict] = None
    compliance_score: Optional[float] = None

class StatusTransition(BaseModel):
    new_status: str
    reviewer_note: Optional[str] = None

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _log_audit(action: str, agent: str, input_summary: str, output_summary: str):
    """Write to audit_log table."""
    try:
        supabase.table("audit_log").insert({
            "id": str(uuid.uuid4()),
            "action": action,
            "agent": agent,
            "input_summary": input_summary,
            "output_summary": output_summary,
            "created_at": datetime.now(timezone.utc).isoformat()
        }).execute()
    except Exception:
        pass  # audit failure should never block main flow

def _get_application_or_404(app_id: str) -> dict:
    result = supabase.table("applications").select("*").eq("id", app_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    return result.data[0]

# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@router.post("/create", summary="Create a new application (starts as DRAFT)")
async def create_application(payload: ApplicationCreate):
    """
    Create a new grant application for an org.
    Status begins as DRAFT automatically.
    """
    # Verify org exists
    org_check = supabase.table("organizations").select("id").eq("id", payload.org_id).execute()
    if not org_check.data:
        raise HTTPException(status_code=404, detail=f"Organization {payload.org_id} not found")

    app_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    record = {
        "id": app_id,
        "org_id": payload.org_id,
        "grant_id": payload.grant_id,
        "status": "DRAFT",
        "narrative": payload.narrative or "",
        "form_data": payload.form_data or {},
        "compliance_score": payload.compliance_score,
        "created_at": now,
    }

    result = supabase.table("applications").insert(record).execute()

    _log_audit(
        action="APPLICATION_CREATED",
        agent="application_state_api",
        input_summary=f"org={payload.org_id} grant={payload.grant_id}",
        output_summary=f"app_id={app_id} status=DRAFT"
    )

    return {
        "success": True,
        "message": "Application created in DRAFT status",
        "application_id": app_id,
        "data": result.data[0] if result.data else record
    }


@router.get("/{app_id}", summary="Get a single application by ID")
async def get_application(app_id: str):
    """Fetch full application record including narrative, form_data, and status."""
    app = _get_application_or_404(app_id)
    return {
        "success": True,
        "data": app
    }


@router.get("/org/{org_id}", summary="List all applications for an organization")
async def list_org_applications(org_id: str, status: Optional[str] = None):
    """
    List all applications for a given org.
    Optionally filter by status: DRAFT | IN_REVIEW | APPROVED | SUBMITTED
    """
    query = supabase.table("applications").select("*").eq("org_id", org_id)

    if status:
        status = status.upper()
        if status not in VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {VALID_STATUSES}"
            )
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).execute()

    return {
        "success": True,
        "org_id": org_id,
        "count": len(result.data),
        "filter_status": status,
        "applications": result.data
    }


@router.get("/all/list", summary="List all applications across all orgs")
async def list_all_applications(status: Optional[str] = None, limit: int = 50):
    """Admin view: list all applications, optionally filtered by status."""
    query = supabase.table("applications").select("*")

    if status:
        status = status.upper()
        if status not in VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {VALID_STATUSES}"
            )
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).limit(limit).execute()

    return {
        "success": True,
        "total": len(result.data),
        "filter_status": status,
        "applications": result.data
    }


@router.put("/{app_id}/update", summary="Update narrative, form_data, or compliance score")
async def update_application(app_id: str, payload: ApplicationUpdate):
    """
    Update application content (narrative, form_data, compliance_score).
    Only allowed when status is DRAFT or IN_REVIEW.
    """
    app = _get_application_or_404(app_id)

    if app["status"].upper() in ["SUBMITTED"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot update a SUBMITTED application."
        )

    updates = {}
    if payload.narrative is not None:
        updates["narrative"] = payload.narrative
    if payload.form_data is not None:
        updates["form_data"] = payload.form_data
    if payload.compliance_score is not None:
        updates["compliance_score"] = payload.compliance_score

    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    result = supabase.table("applications").update(updates).eq("id", app_id).execute()

    _log_audit(
        action="APPLICATION_UPDATED",
        agent="application_state_api",
        input_summary=f"app_id={app_id} fields={list(updates.keys())}",
        output_summary=f"status={app['status']} updated OK"
    )

    return {
        "success": True,
        "message": "Application updated",
        "application_id": app_id,
        "updated_fields": list(updates.keys()),
        "data": result.data[0] if result.data else {}
    }


@router.post("/{app_id}/transition", summary="Advance application to next status")
async def transition_status(app_id: str, payload: StatusTransition):
    """
    Move application through the lifecycle:
    DRAFT → IN_REVIEW → APPROVED → SUBMITTED

    Rules enforced:
    - Can only transition to valid next states
    - SUBMITTED is terminal (no further transitions)
    - Optional reviewer_note is logged to audit_log
    """
    app = _get_application_or_404(app_id)
    current_status = app["status"].upper()
    new_status = payload.new_status.upper()

    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{new_status}'. Valid: {VALID_STATUSES}"
        )

    allowed_next = STATUS_TRANSITIONS.get(current_status, [])
    if new_status not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot transition from '{current_status}' to '{new_status}'. "
                f"Allowed next states: {allowed_next}"
            )
        )

    result = supabase.table("applications").update({"status": new_status}).eq("id", app_id).execute()

    _log_audit(
        action="STATUS_TRANSITION",
        agent="human_in_the_loop",
        input_summary=f"app_id={app_id} {current_status} → {new_status}",
        output_summary=f"note={payload.reviewer_note or 'none'}"
    )

    return {
        "success": True,
        "message": f"Application moved from {current_status} → {new_status}",
        "application_id": app_id,
        "previous_status": current_status,
        "new_status": new_status,
        "reviewer_note": payload.reviewer_note,
        "data": result.data[0] if result.data else {}
    }


@router.get("/{app_id}/history", summary="Get status transition options + current state")
async def get_application_status(app_id: str):
    """
    Returns the current status of an application and what
    transitions are available next (for frontend pipeline view).
    """
    app = _get_application_or_404(app_id)
    current_status = app["status"].upper()
    allowed_next = STATUS_TRANSITIONS.get(current_status, [])

    return {
        "success": True,
        "application_id": app_id,
        "current_status": current_status,
        "allowed_transitions": allowed_next,
        "is_terminal": len(allowed_next) == 0,
        "pipeline": {
            "DRAFT":     current_status == "DRAFT",
            "IN_REVIEW": current_status == "IN_REVIEW",
            "APPROVED":  current_status == "APPROVED",
            "SUBMITTED": current_status == "SUBMITTED",
        },
        "compliance_score": app.get("compliance_score"),
        "created_at": app.get("created_at")
    }


@router.delete("/{app_id}", summary="Delete a DRAFT application")
async def delete_application(app_id: str):
    """
    Delete an application. Only DRAFT status can be deleted.
    Protects IN_REVIEW, APPROVED, and SUBMITTED applications.
    """
    app = _get_application_or_404(app_id)

    if app["status"].upper() != "DRAFT":
        raise HTTPException(
            status_code=400,
            detail=f"Only DRAFT applications can be deleted. Current status: {app['status']}"
        )

    supabase.table("applications").delete().eq("id", app_id).execute()

    _log_audit(
        action="APPLICATION_DELETED",
        agent="application_state_api",
        input_summary=f"app_id={app_id}",
        output_summary="deleted DRAFT application"
    )

    return {
        "success": True,
        "message": f"Application {app_id} deleted",
        "application_id": app_id
    }


@router.get("/pipeline/summary", summary="Dashboard: count applications by status")
async def pipeline_summary():
    """
    Returns a count of applications grouped by status.
    Powers the Vikas frontend dashboard pipeline view.
    """
    all_apps = supabase.table("applications").select("status").execute()

    summary = {s: 0 for s in VALID_STATUSES}
    for app in all_apps.data:
        s = app.get("status", "DRAFT")
        if s in summary:
            summary[s] += 1

    return {
        "success": True,
        "pipeline_summary": summary,
        "total": sum(summary.values())
    }


@router.get("/{app_id}/package", summary="Generate submission package for an application")
async def generate_package(app_id: str):
    """
    Compile a complete submission package:
    - Application metadata (status, dates)
    - Organization profile
    - Grant details
    - Narrative + form data
    - Compliance score
    """
    app = _get_application_or_404(app_id)

    # Fetch org profile
    org_data = {}
    try:
        org = supabase.table("organizations").select("*").eq("id", app.get("org_id", "")).execute()
        if org.data:
            org_data = org.data[0]
    except Exception:
        pass

    # Fetch grant info
    grant_data = {}
    try:
        grant = supabase.table("grants").select("*").eq("id", app.get("grant_id", "")).execute()
        if grant.data:
            grant_data = grant.data[0]
    except Exception:
        pass

    package = {
        "success": True,
        "package": {
            "application_id": app_id,
            "status": app.get("status"),
            "created_at": app.get("created_at"),
            "organization": {
                "name": org_data.get("name", ""),
                "mission": org_data.get("mission", ""),
                "team_size": org_data.get("team_size"),
                "focus_areas": org_data.get("focus_areas", []),
                "budget": org_data.get("budget"),
                "location": org_data.get("location", ""),
            },
            "grant": {
                "title": grant_data.get("title", ""),
                "funder": grant_data.get("funder", ""),
                "amount": grant_data.get("amount", 0),
                "category": grant_data.get("category", ""),
                "description": grant_data.get("description", ""),
            },
            "narrative": app.get("narrative", ""),
            "form_data": app.get("form_data", {}),
            "compliance_score": app.get("compliance_score"),
        }
    }

    _log_audit(
        action="PACKAGE_GENERATED",
        agent="submission_package",
        input_summary=f"app_id={app_id}",
        output_summary=f"status={app.get('status')} org={org_data.get('name', 'unknown')}"
    )

    return package


# ─────────────────────────────────────────────
# SEND APPLICATION PDF VIA EMAIL
# ─────────────────────────────────────────────

class SendEmailRequest(BaseModel):
    to_email: str

def _build_pdf(pkg: dict) -> bytes:
    """Generate a simple PDF from the submission package using PyMuPDF."""
    import fitz  # PyMuPDF

    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4
    y = 50

    def write(text: str, fontsize: float = 11, bold: bool = False):
        nonlocal y, page, doc
        fname = "helv" if not bold else "hebo"
        # Wrap long lines
        lines = []
        while len(text) > 85:
            idx = text[:85].rfind(' ')
            if idx == -1:
                idx = 85
            lines.append(text[:idx])
            text = text[idx:].lstrip()
        lines.append(text)
        for line in lines:
            if y > 780:
                page = doc.new_page(width=595, height=842)
                y = 50
            page.insert_text((50, y), line, fontsize=fontsize, fontname=fname)
            y += fontsize + 4

    p = pkg.get("package", pkg)

    write("GRANT APPLICATION – SUBMISSION PACKAGE", fontsize=16, bold=True)
    y += 10
    write(f"Application ID: {p.get('application_id', 'N/A')}")
    write(f"Status: {p.get('status', 'N/A')}")
    write(f"Created: {p.get('created_at', 'N/A')}")
    y += 10

    org = p.get("organization", {})
    write("ORGANIZATION", fontsize=13, bold=True)
    write(f"Name: {org.get('name', 'N/A')}")
    write(f"Mission: {org.get('mission', 'N/A')}")
    write(f"Location: {org.get('location', 'N/A')}")
    write(f"Team Size: {org.get('team_size', 'N/A')}")
    write(f"Focus Areas: {', '.join(org.get('focus_areas', []))}")
    y += 10

    grant = p.get("grant", {})
    write("GRANT DETAILS", fontsize=13, bold=True)
    write(f"Title: {grant.get('title', 'N/A')}")
    write(f"Funder: {grant.get('funder', 'N/A')}")
    raw_amount = grant.get('amount', 0)
    try:
        amt = float(raw_amount) if raw_amount else 0
        write(f"Amount: ${amt:,.0f}" if amt else "Amount: Varies")
    except (ValueError, TypeError):
        write(f"Amount: {raw_amount}" if raw_amount else "Amount: Varies")
    write(f"Category: {grant.get('category', 'N/A')}")
    write(f"Description: {grant.get('description', 'N/A')}")
    y += 10

    narrative = p.get("narrative", "")
    if narrative:
        write("NARRATIVE", fontsize=13, bold=True)
        # Write narrative in chunks
        for para in narrative.split('\n'):
            if para.strip():
                write(para.strip())
        y += 5

    comp = p.get("compliance_score")
    if comp is not None:
        write(f"Compliance Score: {comp}%", fontsize=12, bold=True)

    y += 15
    write(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", fontsize=9)
    write("EvolveX GrantAgent – AI-Powered Grant Automation", fontsize=9)

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


@router.post("/{app_id}/send", summary="Send application PDF via email")
async def send_application_email(app_id: str, req: SendEmailRequest):
    """Generate PDF from submission package and email it."""
    import os

    # Build the package
    app = _get_application_or_404(app_id)
    org_data = {}
    try:
        org = supabase.table("organizations").select("*").eq("id", app.get("org_id", "")).execute()
        if org.data:
            org_data = org.data[0]
    except Exception:
        pass
    grant_data = {}
    try:
        grant = supabase.table("grants").select("*").eq("id", app.get("grant_id", "")).execute()
        if grant.data:
            grant_data = grant.data[0]
    except Exception:
        pass

    pkg = {
        "package": {
            "application_id": app_id,
            "status": app.get("status"),
            "created_at": app.get("created_at"),
            "organization": {
                "name": org_data.get("name", ""),
                "mission": org_data.get("mission", ""),
                "team_size": org_data.get("team_size"),
                "focus_areas": org_data.get("focus_areas", []),
                "budget": org_data.get("budget"),
                "location": org_data.get("location", ""),
            },
            "grant": {
                "title": grant_data.get("title", ""),
                "funder": grant_data.get("funder", ""),
                "amount": grant_data.get("amount", 0),
                "category": grant_data.get("category", ""),
                "description": grant_data.get("description", ""),
            },
            "narrative": app.get("narrative", ""),
            "form_data": app.get("form_data", {}),
            "compliance_score": app.get("compliance_score"),
        }
    }

    # Generate PDF
    pdf_bytes = _build_pdf(pkg)

    # Send email via SMTP
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not smtp_user or not smtp_pass:
        raise HTTPException(status_code=500, detail="Email service not configured. Set SMTP_USER and SMTP_PASS env vars.")

    org_name = org_data.get("name", "GrantAgent User")
    grant_title = grant_data.get("title", "Grant Application")

    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = req.to_email
    msg["Subject"] = f"Grant Application Submission – {grant_title}"

    body = f"""Dear Reviewer,

Please find attached the grant application submission package from {org_name}.

Grant: {grant_title}
Funder: {grant_data.get('funder', 'N/A')}
Status: {app.get('status', 'DRAFT')}
Compliance Score: {app.get('compliance_score', 'N/A')}%

This document was generated by EvolveX GrantAgent.

Best regards,
{org_name}
"""
    msg.attach(MIMEText(body, "plain"))

    attachment = MIMEBase("application", "pdf")
    attachment.set_payload(pdf_bytes)
    encoders.encode_base64(attachment)
    filename = f"grant-application-{app_id[:8]}.pdf"
    attachment.add_header("Content-Disposition", f"attachment; filename={filename}")
    msg.attach(attachment)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    _log_audit(
        action="APPLICATION_EMAILED",
        agent="email_sender",
        input_summary=f"app_id={app_id} to={req.to_email}",
        output_summary=f"PDF sent to {req.to_email}"
    )

    return {"success": True, "message": f"Application PDF sent to {req.to_email}"}