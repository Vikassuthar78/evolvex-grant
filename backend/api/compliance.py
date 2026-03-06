from fastapi import APIRouter
from schemas.models import ComplianceCheckRequest, ComplianceResponse, ComplianceItem

router = APIRouter()


@router.post("/check", response_model=ComplianceResponse)
async def check_compliance(req: ComplianceCheckRequest):
    """Run compliance validation on an application."""
    return ComplianceResponse(
        overall_score=72,
        items=[
            ComplianceItem(id="cc-1", category="Document Requirements", label="Budget Narrative", status="pass", message="Budget narrative is complete and within limits"),
            ComplianceItem(id="cc-2", category="Document Requirements", label="Letter of Support", status="warning", message="Missing institutional letter of support", suggestion="Request letter from partner university by March 20"),
            ComplianceItem(id="cc-3", category="Eligibility", label="Organization Size", status="pass", message="Team size (12) is under 500 employee limit"),
            ComplianceItem(id="cc-4", category="Eligibility", label="US-based Entity", status="pass", message="Organization is registered in California, US"),
            ComplianceItem(id="cc-5", category="Content Limits", label="Project Narrative", status="warning", message="Word count (4,850) exceeds recommended 4,500 words", suggestion="Reduce methodology section by ~350 words"),
            ComplianceItem(id="cc-6", category="Content Limits", label="Abstract", status="pass", message="Abstract is 245 words (limit: 250)"),
            ComplianceItem(id="cc-7", category="Budget", label="Budget Ceiling", status="fail", message="Total budget ($285,000) exceeds $275,000 limit", suggestion="Reduce equipment costs or travel by $10,000"),
            ComplianceItem(id="cc-8", category="Budget", label="Indirect Cost Rate", status="pass", message="Indirect rate (42%) is within negotiated agreement"),
        ],
    )
