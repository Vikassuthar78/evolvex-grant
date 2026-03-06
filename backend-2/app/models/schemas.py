from pydantic import BaseModel
from typing import Optional, List


class OrgProfile(BaseModel):
    name: str
    sector: Optional[str] = None
    country: Optional[str] = None
    mission: Optional[str] = None
    funding_need: Optional[float] = None
    team_size: Optional[str] = None
    focus_areas: Optional[List[str]] = []
    past_impact: Optional[str] = None
    budget: Optional[float] = None
    past_projects: Optional[str] = None
    location: Optional[str] = None


class NarrativeRequest(BaseModel):
    org_id: str
    grant_id: str
    grant_title: str
    funder_name: str
    funder_priorities: str
    org_mission: Optional[str] = ""
    project_description: Optional[str] = ""


class NarrativeResponse(BaseModel):
    essay: str
    word_count: int
    funder_keywords_used: List[str] = []


class ComplianceRequest(BaseModel):
    narrative: str
    word_limit: Optional[int] = None
    eligibility_criteria: Optional[str] = None


class ComplianceResponse(BaseModel):
    score: int
    passed: bool
    issues: List[str] = []
    suggestions: List[str] = []
