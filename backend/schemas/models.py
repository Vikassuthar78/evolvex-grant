from pydantic import BaseModel
from typing import Optional


class OrganizationCreate(BaseModel):
    name: str
    mission: str
    sector: str
    country: str
    team_size: int = 0
    budget: float = 0
    funding_need: float = 0
    focus_areas: list[str] = []
    past_projects: list[str] = []


class OrganizationResponse(BaseModel):
    id: str
    name: str
    mission: str
    sector: str
    country: str
    team_size: int
    budget: float
    location: str
    focus_areas: list[str]
    past_projects: list[str]
    created_at: str


class GrantResponse(BaseModel):
    id: str
    title: str
    funder: str
    amount: float
    deadline: str
    eligibility: list[str]
    keywords: list[str]
    fit_score: int
    probability_score: int
    status: str
    description: str
    category: str


class EligibilityRequest(BaseModel):
    grant_id: str
    org_id: str


class EligibilityResponse(BaseModel):
    eligible: bool
    confidence: float
    reasons: list[str]
    warnings: list[str]


class NarrativeRequest(BaseModel):
    grant_id: str
    section: str = "project_summary"
    tone: str = "professional"


class NarrativeResponse(BaseModel):
    section: str
    content: str
    word_count: int
    tone: str
    suggestions: list[str]


class ComplianceCheckRequest(BaseModel):
    application_id: str


class ComplianceItem(BaseModel):
    id: str
    category: str
    label: str
    status: str  # pass, warning, fail
    message: str
    suggestion: Optional[str] = None


class ComplianceResponse(BaseModel):
    overall_score: int
    items: list[ComplianceItem]


class ReviewRequest(BaseModel):
    application_id: str


class ReviewSection(BaseModel):
    section: str
    score: int
    max_score: int
    feedback: str
    strengths: list[str]
    weaknesses: list[str]


class ReviewResponse(BaseModel):
    overall_score: float
    sections: list[ReviewSection]


class AuditEntry(BaseModel):
    id: str
    action: str
    agent: str
    timestamp: str
    input_summary: str
    output_summary: str
