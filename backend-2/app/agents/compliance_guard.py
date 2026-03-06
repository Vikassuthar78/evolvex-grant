import re
from app.models.schemas import ComplianceRequest, ComplianceResponse

class ComplianceGuard:

    def validate(self, req: ComplianceRequest) -> ComplianceResponse:
        issues = []
        suggestions = []
        score = 100

        narrative = req.narrative
        word_count = len(narrative.split())

        # ── Check 1: Word limit ──
        if req.word_limit and word_count > req.word_limit:
            over = word_count - req.word_limit
            issues.append(f"Exceeds word limit by {over} words ({word_count}/{req.word_limit})")
            suggestions.append(f"Remove {over} words — cut filler phrases")
            score -= 20

        # ── Check 2: Too short ──
        if word_count < 100:
            issues.append(f"Too short — only {word_count} words (minimum 100)")
            suggestions.append("Expand with specific outcomes and impact metrics")
            score -= 30

        # ── Check 3: No numbers/metrics ──
        if not any(c.isdigit() for c in narrative):
            issues.append("No measurable metrics found")
            suggestions.append("Add numbers: beneficiaries, percentages, timeframes")
            score -= 15

        # ── Check 4: No impact language ──
        impact_words = ["impact", "outcome", "result", "achieve", "benefit", "improve", "transform", "serve"]
        if not any(w in narrative.lower() for w in impact_words):
            issues.append("No impact language detected")
            suggestions.append("Add: 'will result in', 'will impact', 'will achieve'")
            score -= 10

        # ── Check 5: No org type mentioned ──
        org_words = ["organization", "nonprofit", "foundation", "institute", "center", "agency"]
        if not any(w in narrative.lower() for w in org_words):
            issues.append("Organization type not mentioned")
            suggestions.append("State your organization type early in the narrative")
            score -= 5

        # ── Check 6: Eligibility match ──
        if req.eligibility_criteria:
            key_words = [w for w in req.eligibility_criteria.lower().split() if len(w) > 5]
            matched = [w for w in key_words if w in narrative.lower()]
            if key_words and len(matched) < len(key_words) * 0.3:
                issues.append("Narrative doesn't address eligibility criteria")
                suggestions.append(f"Include keywords: {', '.join(key_words[:5])}")
                score -= 15

        # ── Check 7: Sentence structure ──
        if narrative.count(".") < 3:
            issues.append("Narrative lacks proper sentence structure")
            suggestions.append("Write complete sentences with proper punctuation")
            score -= 5

        score = max(0, min(100, score))

        return ComplianceResponse(
            score=score,
            passed=score >= 70,
            issues=issues if issues else ["✅ No major issues found"],
            suggestions=suggestions if suggestions else ["✅ Narrative looks good!"]
        )

compliance_guard = ComplianceGuard()