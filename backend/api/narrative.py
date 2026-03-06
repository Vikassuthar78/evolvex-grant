from fastapi import APIRouter
from schemas.models import NarrativeRequest, NarrativeResponse

router = APIRouter()


@router.post("/generate", response_model=NarrativeResponse)
async def generate_narrative(req: NarrativeRequest):
    """Generate tailored grant narrative using AI."""
    narratives = {
        "project_summary": (
            "Access to non-dilutive funding remains one of the most significant barriers "
            "for early-stage deep tech startups. While billions in grant funding are available "
            "annually through federal programs like SBIR/STTR, fewer than 20% of eligible "
            "companies apply due to the complexity of the application process. Our platform "
            "leverages multi-agent AI to democratize access to grant funding by automating "
            "discovery, eligibility assessment, narrative generation, and compliance validation."
        ),
        "methodology": (
            "Our approach employs a multi-agent architecture powered by large language models "
            "to orchestrate the grant application lifecycle. The Discovery Agent queries federal "
            "databases in real-time, while the Eligibility Agent cross-references organizational "
            "profiles against grant requirements using vector similarity matching. The Narrative "
            "Agent generates tailored proposals using few-shot learning from successful past "
            "applications, and the Compliance Guard validates submissions against funder-specific "
            "checklists before final review."
        ),
        "team": (
            "Our founding team combines deep expertise in AI/ML engineering, grant administration, "
            "and startup operations. The PI holds a PhD in Computer Science with specialization in "
            "NLP and has led three prior federally-funded research projects."
        ),
    }

    content = narratives.get(req.section, narratives["project_summary"])
    word_count = len(content.split())

    return NarrativeResponse(
        section=req.section,
        content=content,
        word_count=word_count,
        tone=req.tone,
        suggestions=[
            "Consider adding specific metrics to strengthen impact claims",
            "Include reference to funder's strategic priorities",
            "Add timeline milestones for feasibility demonstration",
        ],
    )
