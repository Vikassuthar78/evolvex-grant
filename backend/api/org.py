from fastapi import APIRouter
from schemas.models import OrganizationCreate, OrganizationResponse
import uuid
from datetime import datetime

router = APIRouter()


@router.post("/save", response_model=OrganizationResponse)
async def save_organization(org: OrganizationCreate):
    """Save or update organization profile."""
    return OrganizationResponse(
        id=str(uuid.uuid4()),
        name=org.name,
        mission=org.mission,
        sector=org.sector,
        country=org.country,
        team_size=org.team_size,
        budget=org.budget,
        location=org.country,
        focus_areas=org.focus_areas,
        past_projects=org.past_projects,
        created_at=datetime.utcnow().isoformat(),
    )
