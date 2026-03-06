import httpx
from app.core.database import supabase
from app.core.embeddings import embedding_service

GRANTS_GOV_URL = "https://api.grants.gov/v1/api/search2"

class DiscoveryAgent:

    # ── Fetch from Grants.gov ──
    async def fetch_from_grants_gov(self, keyword: str, rows: int = 20) -> list:
        payload = {
            "keyword": keyword,
            "rows": rows,
            "oppStatuses": "posted|forecasted"
        }
        try:
            async with httpx.AsyncClient(timeout=30) as http:
                response = await http.post(
                    GRANTS_GOV_URL,
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                data = response.json()

            grants = []
            opportunities = data.get("data", {}).get("oppHits", [])

            for opp in opportunities:
                # Parse amount range into a single number (ceiling)
                award_ceiling = opp.get('awardCeiling', 0) or 0
                award_floor = opp.get('awardFloor', 0) or 0
                amount = award_ceiling if award_ceiling else award_floor

                # Parse eligibility into a list
                elig_raw = opp.get("eligibilities", "")
                eligibility = [e.strip() for e in elig_raw.split(",") if e.strip()] if isinstance(elig_raw, str) and elig_raw else []

                # Parse keywords into a list
                keywords_list = [k.strip() for k in keyword.split(",") if k.strip()] if "," in keyword else [keyword]

                grant = {
                    "id": str(opp.get("id", "")),
                    "title": opp.get("title", ""),
                    "funder": opp.get("agency", opp.get("agencyName", "Federal Agency")),
                    "amount": amount,
                    "deadline": opp.get("closeDate", "Open"),
                    "eligibility": eligibility,
                    "keywords": keywords_list,
                    "category": opp.get("oppCategory", {}).get("category", "Federal") if isinstance(opp.get("oppCategory"), dict) else "Federal",
                    "description": opp.get("description", opp.get("title", "")),
                    "status": "open",
                    "fitScore": 0,
                    "probabilityScore": 0,
                    "source_url": f"https://grants.gov/search-results-detail/{opp.get('id', '')}",
                }
                grants.append(grant)

            return grants

        except Exception as e:
            print(f"Grants.gov API error: {e}")
            return []

    # ── Save grants to Supabase ──
    async def save_grants_to_db(self, grants: list) -> int:
        if not grants:
            return 0
        try:
            db_fields = {"id", "title", "funder", "amount", "deadline", "eligibility",
                         "keywords", "category", "source_url", "fit_score"}
            clean = [{k: v for k, v in g.items() if k in db_fields} for g in grants]
            result = supabase.table("grants").upsert(clean).execute()
            return len(result.data)
        except Exception as e:
            print(f"DB save error: {e}")
            return 0

    # ── Full Match Pipeline ──
    async def find_matches(self, org_id: str, limit: int = 10) -> list:

        # Get org profile
        org = supabase.table("organizations").select("*").eq("id", org_id).execute()
        if not org.data:
            return []

        org_data = org.data[0]
        focus_areas = org_data.get("focus_areas", [])
        mission = org_data.get("mission", "")

        # Fetch grants from Grants.gov
        all_grants = []
        for keyword in focus_areas[:3]:
            fetched = await self.fetch_from_grants_gov(keyword, rows=15)
            all_grants.extend(fetched)

        mission_keyword = mission.split()[0] if mission else "community"
        fetched = await self.fetch_from_grants_gov(mission_keyword, rows=10)
        all_grants.extend(fetched)

        # Remove duplicates
        seen = set()
        unique_grants = []
        for g in all_grants:
            if g["title"] not in seen and g["title"]:
                seen.add(g["title"])
                unique_grants.append(g)

        # Fallback to DB
        if not unique_grants:
            print("Using DB fallback")
            db_grants = supabase.table("grants").select("*").execute()
            unique_grants = db_grants.data or []

        # Score using local embeddings
        ranked = embedding_service.rank_grants(mission, focus_areas, unique_grants)
        top_grants = ranked[:limit]

        # Save to DB
        await self.save_grants_to_db(top_grants)

        return top_grants

    # ── Quick Search ──
    async def search_grants(self, keyword: str, rows: int = 10) -> list:
        return await self.fetch_from_grants_gov(keyword, rows)