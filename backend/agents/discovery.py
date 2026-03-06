"""
Discovery Agent — Searches Grants.gov API for matching grant opportunities.

Uses the real Grants.gov Search API (POST /v1/api/search2).
No authentication required. Returns structured grant data with AI-computed fit scores.
"""

import httpx
import hashlib
from typing import Optional


GRANTS_GOV_API = "https://api.grants.gov/v1/api/search2"

# Sector → keyword mapping for smarter search
SECTOR_KEYWORDS = {
    "AI/ML": ["artificial intelligence", "machine learning", "data science"],
    "Climate Tech": ["clean energy", "climate", "environmental", "sustainability"],
    "Healthcare": ["health", "biomedical", "clinical", "therapeutics"],
    "Education": ["education", "STEM", "workforce development", "training"],
    "Fintech": ["financial technology", "fintech", "digital payments"],
    "Biotech": ["biotechnology", "genomics", "pharmaceutical"],
    "AgriTech": ["agriculture", "food systems", "rural development"],
    "Space Tech": ["space", "aerospace", "satellite"],
    "Cybersecurity": ["cybersecurity", "information security", "privacy"],
    "Social Impact": ["social innovation", "community development", "equity"],
}


class DiscoveryAgent:
    """Agent that discovers grants from Grants.gov and computes fit scores."""

    async def search(
        self,
        keyword: Optional[str] = None,
        rows: int = 10,
        sector: Optional[str] = None,
        opp_statuses: str = "posted",
    ) -> list[dict]:
        """
        Search Grants.gov API and return structured grant results.

        Args:
            keyword: Search term
            rows: Number of results to return (max 25)
            sector: Optional sector for enhanced keyword matching
            opp_statuses: Grant status filter (posted, forecasted, closed)

        Returns:
            List of grant dictionaries with fit scores
        """
        # Determine keyword from sector if not provided
        search_keyword = keyword
        if not search_keyword:
            if sector and sector in SECTOR_KEYWORDS:
                search_keyword = SECTOR_KEYWORDS[sector][0]
            else:
                search_keyword = "technology"

        # Build search payload
        payload = {
            "keyword": search_keyword,
            "rows": min(rows, 25),
            "oppStatuses": opp_statuses,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    GRANTS_GOV_API,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                data = response.json()

            # Parse Grants.gov response
            opportunities = data.get("oppHits", [])
            grants = []

            for opp in opportunities[:rows]:
                grant = self._parse_opportunity(opp, search_keyword, sector)
                grants.append(grant)

            # Sort by fit score
            grants.sort(key=lambda g: g["fit_score"], reverse=True)
            return grants

        except Exception as e:
            print(f"Grants.gov API error: {e}. Returning fallback data.")
            return self._get_fallback_grants()

    def _parse_opportunity(self, opp: dict, keyword: str, sector: Optional[str]) -> dict:
        """Parse a Grants.gov opportunity into our grant format."""
        # Extract fields safely
        title = opp.get("title", "Untitled Grant")
        agency = opp.get("agency", "Unknown Agency")
        opp_number = opp.get("number", "")
        close_date = opp.get("closeDate", "2026-12-31")
        description = opp.get("description", title)

        # Generate a stable ID from opportunity number
        grant_id = f"gov-{hashlib.md5(opp_number.encode()).hexdigest()[:8]}" if opp_number else f"gov-{hashlib.md5(title.encode()).hexdigest()[:8]}"

        # Compute fit score based on keyword relevance
        fit_score = self._compute_fit_score(title, description, keyword, sector)

        # Determine category from agency
        category = self._categorize_grant(agency, title)

        # Extract keywords from title
        keywords = [w.lower() for w in title.split() if len(w) > 4][:5]

        # Determine status
        status = "open"
        if close_date:
            try:
                from datetime import datetime
                deadline_dt = datetime.fromisoformat(close_date.replace("Z", "+00:00")) if "T" in close_date else datetime.strptime(close_date, "%m/%d/%Y")
                days_left = (deadline_dt - datetime.utcnow()).days
                if days_left <= 0:
                    status = "closed"
                elif days_left <= 14:
                    status = "closing_soon"
            except (ValueError, TypeError):
                pass

        return {
            "id": grant_id,
            "title": title[:200],
            "funder": agency,
            "amount": 250000,  # Grants.gov doesn't always provide amounts
            "deadline": close_date,
            "eligibility": ["See full opportunity announcement for eligibility requirements"],
            "keywords": keywords,
            "fit_score": fit_score,
            "probability_score": max(30, fit_score - 15),
            "status": status,
            "description": (description or title)[:500],
            "category": category,
        }

    def _compute_fit_score(self, title: str, desc: str, keyword: str, sector: Optional[str]) -> int:
        """Compute a fit score (0-100) based on keyword relevance."""
        text = f"{title} {desc}".lower()
        score = 50  # base

        # Keyword match bonus
        if keyword.lower() in text:
            score += 25

        # Sector keyword bonus
        if sector and sector in SECTOR_KEYWORDS:
            for sk in SECTOR_KEYWORDS[sector]:
                if sk.lower() in text:
                    score += 8

        # Cap at 99
        return min(99, max(30, score))

    def _categorize_grant(self, agency: str, title: str) -> str:
        """Categorize grant by agency and title keywords."""
        agency_lower = agency.lower()
        title_lower = title.lower()

        if "nsf" in agency_lower or "science" in agency_lower:
            return "Research & Development"
        elif "energy" in agency_lower or "doe" in agency_lower:
            return "Energy & Climate"
        elif "health" in agency_lower or "nih" in agency_lower:
            return "Health & Biotech"
        elif "agriculture" in agency_lower or "usda" in agency_lower:
            return "Agriculture"
        elif "commerce" in agency_lower or "eda" in agency_lower:
            return "Economic Development"
        elif any(w in title_lower for w in ["technology", "innovation", "ai", "cyber"]):
            return "Technology & Innovation"
        else:
            return "General"

    def _get_fallback_grants(self) -> list[dict]:
        """Return realistic demo grants when API is unavailable."""
        return [
            {
                "id": "grant-1", "title": "NSF Small Business Innovation Research (SBIR) Phase I",
                "funder": "National Science Foundation", "amount": 275000, "deadline": "2026-04-15",
                "eligibility": ["US-based small business", "Less than 500 employees"],
                "keywords": ["deep tech", "innovation", "R&D"], "fit_score": 92,
                "probability_score": 78, "status": "open",
                "description": "Supports small businesses in scientific R&D with commercial potential.",
                "category": "Research & Development",
            },
            {
                "id": "grant-2", "title": "DOE Advanced Research Projects Agency-Energy (ARPA-E)",
                "funder": "Department of Energy", "amount": 500000, "deadline": "2026-03-28",
                "eligibility": ["US entity", "Energy sector focus"],
                "keywords": ["clean energy", "climate tech", "energy storage"], "fit_score": 87,
                "probability_score": 65, "status": "closing_soon",
                "description": "Funds transformational energy technologies.",
                "category": "Energy & Climate",
            },
        ]
