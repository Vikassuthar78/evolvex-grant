from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import org, grants, narrative, compliance, review, audit

app = FastAPI(
    title="GrantAgent API",
    description="AI-powered autonomous grant application platform",
    version="1.0.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(org.router, prefix="/api/org", tags=["Organization"])
app.include_router(grants.router, prefix="/api/grants", tags=["Grants"])
app.include_router(narrative.router, prefix="/api/narrative", tags=["Narrative"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(review.router, prefix="/api/review", tags=["Review"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])


@app.get("/")
async def root():
    return {
        "name": "GrantAgent API",
        "version": "1.0.0",
        "status": "running",
        "agents": [
            "discovery", "eligibility", "narrative",
            "autofill", "compliance", "reviewer", "audit"
        ],
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
