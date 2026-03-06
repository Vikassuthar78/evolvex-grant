from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import org, grants, narrative, compliance, match, autofill, dashboard, review, admin
from app.api.application import router as applications_router

app = FastAPI(
    title="EvolveX Grant Agent API",
    description="AI-powered grant application automation",
    version="1.0.0"
)

# Build allowed origins list
_origins = [settings.FRONTEND_URL]
if settings.FRONTEND_URL != "http://localhost:3000":
    _origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(org.router, prefix="/api", tags=["Organization"])
app.include_router(grants.router, prefix="/api", tags=["Grants"])
app.include_router(narrative.router, prefix="/api", tags=["Narrative"])
app.include_router(compliance.router, prefix="/api", tags=["Compliance"])
app.include_router(match.router, prefix="/api", tags=["Matching"])
app.include_router(autofill.router, prefix="/api", tags=["AutoFill"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(review.router, prefix="/api", tags=["Review"])
app.include_router(applications_router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {
        "status": "✅ EvolveX Grant Agent API is running",
        "version": "1.0.0",
        "endpoints": [
            "POST /api/org/save",
            "GET  /api/grants/discover",
            "POST /api/narrative/generate",
            "POST /api/compliance/check"
        ]
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}