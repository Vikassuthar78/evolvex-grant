# ⚡ EvolveX Grant Agent — Backend

AI-powered autonomous grant application agent built for HackForge by EvolveX.

## 🚀 Live Demo
- **Frontend:** (Vikas adds Vercel URL here)
- **Backend API:** (Railway URL — added after deploy)
- **API Docs:** `{backend-url}/docs`

## 🏗️ Architecture
```
Frontend (Next.js) → Backend (FastAPI) → AI Agents → Grants.gov + Supabase
```

## 🤖 AI Agent Pipeline
```
Org Profile → Discovery Agent → Embedding Match → Auto-Fill → Narrative AI → Compliance Guard → Human Review → Submit
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| AI Narrative | Ollama + Qwen2.5 7B (local) |
| Embeddings | sentence-transformers (local, RTX 4060) |
| Grant Data | Grants.gov REST API |
| Database | Supabase (PostgreSQL) |
| PDF Parser | PyMuPDF |
| Deployment | Railway |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/org/save` | Save org profile |
| GET | `/api/org/{id}` | Get org profile |
| GET | `/api/grants/search` | Search Grants.gov |
| GET | `/api/grants/discover` | Get matched grants |
| GET | `/api/match/{org_id}` | Ranked grant matches with fit scores |
| POST | `/api/narrative/generate` | Generate tailored narrative |
| POST | `/api/narrative/full-application` | Full application package |
| POST | `/api/autofill/fill` | Auto-fill grant form |
| GET | `/api/autofill/mock-form/{org_id}` | Demo form with org data |
| POST | `/api/compliance/check` | Validate application |
| GET | `/api/compliance/check/{app_id}` | Check saved application |

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/Vikassuthar78/evolvex-grant-agent.git
cd evolvex-grant-agent/backend
```

### 2. Create virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
python -m pip install -r requirements.txt
```

### 4. Setup environment variables
```bash
cp .env.example .env
# Fill in your API keys
```

### 5. Install Ollama (for narrative generation)
- Download from ollama.com
- Run: `ollama pull qwen2.5:7b`

### 6. Run the server
```bash
uvicorn app.main:app --reload --port 8000
```

### 7. Open API docs
```
http://localhost:8000/docs
```

## 🔑 Environment Variables

Create a `.env` file with:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=sk-ant-your-key (optional)
OPENAI_API_KEY=sk-your-key (optional)
APP_ENV=development
APP_PORT=8000
FRONTEND_URL=http://localhost:3000
```

## 📦 Requirements
```
fastapi
uvicorn
anthropic
openai
supabase
python-dotenv
httpx
PyMuPDF
pydantic
numpy
langchain
langchain-anthropic
langchain-openai
sentence-transformers
python-multipart
pytest
```

## 👥 Team

| Person | Role |
|--------|------|
| Vinay | Backend + AI Agent |
| Vikas | Frontend + Database |
| Sri Kiran | Pitch + Demo + Presentation |

## 🏆 HackForge — EvolveX Problem Statement
Built for the HackForge Hackathon by EvolveX Spaces.
Problem: Automate the full grant application lifecycle using AI agents.