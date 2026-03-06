import numpy as np
import re
from openai import OpenAI
from app.core.config import settings

try:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
except Exception:
    client = None

_USE_EMBEDDINGS = None  # lazy check


def _keyword_similarity(text_a: str, text_b: str) -> float:
    """Fallback keyword-based similarity when embeddings are unavailable."""
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
                  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
                  'should', 'may', 'might', 'shall', 'can', 'this', 'that', 'these',
                  'those', 'it', 'its', 'not', 'no', 'as', 'if', 'than', 'so'}
    
    def tokenize(text: str) -> set:
        words = set(re.findall(r'[a-z]{3,}', text.lower()))
        return words - stop_words
    
    words_a = tokenize(text_a)
    words_b = tokenize(text_b)
    if not words_a or not words_b:
        return 0.0
    overlap = words_a & words_b
    union = words_a | words_b
    jaccard = len(overlap) / len(union) if union else 0.0
    # Scale to realistic range (0.4 - 0.9)
    return min(0.4 + jaccard * 1.2, 0.95)


class EmbeddingService:

    def _can_use_embeddings(self) -> bool:
        global _USE_EMBEDDINGS
        if _USE_EMBEDDINGS is not None:
            return _USE_EMBEDDINGS
        try:
            if not client:
                _USE_EMBEDDINGS = False
                return False
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input="test"
            )
            _USE_EMBEDDINGS = True
            return True
        except Exception as e:
            print(f"OpenAI embeddings unavailable, using keyword fallback: {e}")
            _USE_EMBEDDINGS = False
            return False

    def get_embedding(self, text: str) -> list:
        if not self._can_use_embeddings():
            return [0.0] * 1536
        try:
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=text[:2000]
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding error: {e}")
            return [0.0] * 1536

    def cosine_similarity(self, a: list, b: list) -> float:
        a, b = np.array(a), np.array(b)
        norm = np.linalg.norm(a) * np.linalg.norm(b)
        if norm == 0:
            return 0.0
        return float(np.dot(a, b) / norm)

    def similarity_score(self, text_a: str, text_b: str) -> float:
        if not self._can_use_embeddings():
            return _keyword_similarity(text_a, text_b)
        emb_a = self.get_embedding(text_a)
        emb_b = self.get_embedding(text_b)
        return self.cosine_similarity(emb_a, emb_b)

    def rank_grants(self, org_mission: str, focus_areas: list, grants: list) -> list:
        org_text = f"{org_mission} {' '.join(focus_areas)}"
        use_embeddings = self._can_use_embeddings()

        if use_embeddings:
            org_embedding = self.get_embedding(org_text)

        scored = []
        for grant in grants:
            elig = grant.get('eligibility', '')
            kw = grant.get('keywords', '')
            elig_str = ' '.join(elig) if isinstance(elig, list) else str(elig)
            kw_str = ' '.join(kw) if isinstance(kw, list) else str(kw)
            grant_text = f"{grant.get('title', '')} {elig_str} {kw_str} {grant.get('description', '')}"

            if use_embeddings:
                grant_embedding = self.get_embedding(grant_text)
                score = self.cosine_similarity(org_embedding, grant_embedding)
            else:
                score = _keyword_similarity(org_text, grant_text)

            fit = round(score * 100, 1)
            grant["fit_score"] = fit
            grant["fitScore"] = fit
            grant["probabilityScore"] = round(fit * 0.85, 1)
            grant["urgency"] = "high" if grant.get("deadline", "Open") != "Open" else "normal"
            scored.append(grant)

        scored.sort(key=lambda x: x["fit_score"], reverse=True)
        return scored

embedding_service = EmbeddingService()
