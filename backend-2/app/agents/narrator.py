from groq import Groq
from app.models.schemas import NarrativeRequest, NarrativeResponse
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.1-8b-instant"  # free and fast

class NarratorAgent:

    def _call_groq(self, prompt: str, max_tokens: int = 1000) -> str:
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq error: {e}")
            return f"Error generating narrative: {e}"

    def generate(self, req: NarrativeRequest) -> NarrativeResponse:
        prompt = f"""You are an expert grant writer with 20 years of experience.
Write a compelling, tailored grant application narrative.

FUNDER: {req.funder_name}
FUNDER PRIORITIES: {req.funder_priorities}
GRANT TITLE: {req.grant_title}
ORGANIZATION MISSION: {req.org_mission}
PROJECT DESCRIPTION: {req.project_description or 'Community empowerment through technology'}

Write a powerful narrative (400-500 words) that:
1. Opens with a compelling problem statement using real statistics
2. Directly aligns with funder priorities: {req.funder_priorities}
3. Clearly describes the solution and methodology
4. Includes specific measurable outcomes (numbers, percentages, timelines)
5. Closes with a strong call to action

Use specific language from the funder priorities.
Include at least 3 specific numbers or metrics.
Do NOT write a generic essay. Make it specific to this funder."""

        essay = self._call_groq(prompt, max_tokens=800)
        words = essay.split()
        priority_words = req.funder_priorities.lower().split()
        keywords_used = [w for w in priority_words if w in essay.lower() and len(w) > 4]

        return NarrativeResponse(
            essay=essay,
            word_count=len(words),
            funder_keywords_used=list(set(keywords_used))[:10]
        )

    def generate_impact_statement(self, org_mission: str, focus_areas: list) -> str:
        prompt = f"""Write a powerful 2-sentence impact statement for a grant application.
Organization Mission: {org_mission}
Focus Areas: {', '.join(focus_areas)}
Make it specific, emotional, and data-driven. Include numbers.
Only write the 2 sentences, nothing else."""
        return self._call_groq(prompt, max_tokens=150)

    def generate_budget_justification(self, budget: float, project_description: str) -> str:
        prompt = f"""Write a professional budget justification for a grant application.
Total Budget: ${budget:,.0f}
Project: {project_description}

Break down into:
- Personnel (40%): ${budget*0.4:,.0f}
- Program Costs (35%): ${budget*0.35:,.0f}
- Operations (15%): ${budget*0.15:,.0f}
- Evaluation (10%): ${budget*0.10:,.0f}

Write 2-3 sentences justifying each category. Be specific."""
        return self._call_groq(prompt, max_tokens=400)

narrator_agent = NarratorAgent()