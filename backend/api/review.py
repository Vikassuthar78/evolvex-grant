from fastapi import APIRouter
from schemas.models import ReviewRequest, ReviewResponse, ReviewSection

router = APIRouter()


@router.post("/simulate", response_model=ReviewResponse)
async def simulate_review(req: ReviewRequest):
    """Simulate grant reviewer feedback on an application."""
    sections = [
        ReviewSection(
            section="Project Summary",
            score=9, max_score=10,
            feedback="Clearly articulates the problem and proposed solution. Strong alignment with funder priorities.",
            strengths=["Clear problem statement", "Measurable outcomes defined", "Aligns with NSF mission"],
            weaknesses=["Could mention broader impacts more explicitly"],
        ),
        ReviewSection(
            section="Technical Approach",
            score=8, max_score=10,
            feedback="Sound methodology with innovative elements. Feasibility is well-demonstrated.",
            strengths=["Novel technical approach", "Clear milestones", "Strong preliminary data"],
            weaknesses=["Risk mitigation could be more detailed", "Timeline may be ambitious"],
        ),
        ReviewSection(
            section="Team & Capabilities",
            score=7, max_score=10,
            feedback="Strong PI qualifications. Team composition is adequate but could be stronger.",
            strengths=["PI has relevant expertise", "Prior successful projects"],
            weaknesses=["Missing key technical hire", "Advisory board not yet formed"],
        ),
        ReviewSection(
            section="Budget Justification",
            score=8, max_score=10,
            feedback="Well-justified expenses. Clear connection between costs and project activities.",
            strengths=["Detailed line items", "Reasonable cost estimates"],
            weaknesses=["Equipment costs could use more detail"],
        ),
    ]
    total = sum(s.score for s in sections)
    max_total = sum(s.max_score for s in sections)
    return ReviewResponse(
        overall_score=round(total / max_total * 10, 1),
        sections=sections,
    )
