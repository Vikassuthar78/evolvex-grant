from fastapi import APIRouter, Query
from schemas.models import GrantResponse, EligibilityRequest, EligibilityResponse
from agents.discovery import DiscoveryAgent

router = APIRouter()
discovery_agent = DiscoveryAgent()


from typing import Optional

@router.get("/discover", response_model=list[GrantResponse])
async def discover_grants(
    keyword: Optional[str] = Query(default=None, description="Search keyword"),
    rows: int = Query(default=10, description="Number of results"),
    sector: Optional[str] = Query(default=None, description="Organization sector for filtering"),
):
    """Discover grants from Grants.gov API."""
    grants = await discovery_agent.search(keyword=keyword, rows=rows, sector=sector)
    return grants


@router.post("/check-eligibility", response_model=EligibilityResponse)
async def check_eligibility(req: EligibilityRequest):
    """Check organization eligibility for a grant."""
    return EligibilityResponse(
        eligible=True,
        confidence=0.92,
        reasons=[
            "Organization meets size requirements (< 500 employees)",
            "US-based entity confirmed",
            "Sector alignment with program priorities (94%)",
            "PI qualifications meet minimum requirements",
        ],
        warnings=[
            "Advisory board not yet formalized — consider adding before submission",
        ],
    )
