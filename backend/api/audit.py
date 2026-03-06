from fastapi import APIRouter
from schemas.models import AuditEntry

router = APIRouter()


@router.get("/log", response_model=list[AuditEntry])
async def get_audit_log():
    """Get audit log of all AI agent actions."""
    return [
        AuditEntry(id="al-1", action="Grant Discovery", agent="Discovery Agent", timestamp="2026-03-06T09:00:00Z", input_summary="Keywords: AI, climate tech, energy", output_summary="Found 12 matching grants from Grants.gov"),
        AuditEntry(id="al-2", action="Eligibility Check", agent="Eligibility Agent", timestamp="2026-03-06T09:15:00Z", input_summary="Org profile vs NSF SBIR requirements", output_summary="Eligible: 92% confidence. All criteria met."),
        AuditEntry(id="al-3", action="Narrative Generation", agent="Narrative Agent", timestamp="2026-03-06T09:30:00Z", input_summary="Grant: NSF SBIR, Section: Project Summary", output_summary="Generated 245-word project summary. Tone: Professional."),
        AuditEntry(id="al-4", action="Compliance Check", agent="Compliance Guard", timestamp="2026-03-06T10:00:00Z", input_summary="Application app-1 full validation", output_summary="6 pass, 2 warnings, 1 fail. Score: 72%"),
        AuditEntry(id="al-5", action="Review Simulation", agent="Reviewer Simulator", timestamp="2026-03-06T10:15:00Z", input_summary="Full proposal for NSF SBIR", output_summary="Overall score: 8.0/10. Recommend: minor revisions."),
    ]
