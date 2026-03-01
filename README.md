# AI Business Chat Assistant (ChatBot)

Production-ready, multi-tenant AI customer-support SaaS platform that businesses can integrate into any website.

## Architecture Highlights
- **Multi-Tenant Monolith**: Strict tenant isolation at API, database, and retrieval layers.
- **AI Orchestration**: LangGraph-based retrieval-augmented generation (RAG) with provider abstraction (OpenAI, Anthropic, Gemini).
- **Knowledge Base**: Automated ingestion for PDFs, Markdown/TXT, and URLs with pgvector vector search.
- **Embeddable Widget**: Lightweight Web Component embeddable across customer websites.
- **Tenant Dashboard**: Modern Next.js UI for assistant customization, conversation inspection, and analytics.

## Repository Layout
```text
ChatBot/
├── backend/            # FastAPI async application & Celery workers
│   ├── app/            # Core, models, schemas, services, API v1, AI graph
│   └── tests/          # Unit and integration test suites
├── dashboard/          # Next.js tenant administrative dashboard
├── widget/             # Vanilla TS / Web Component embeddable chat widget
├── docs/               # System architecture and deployment guides
├── scripts/            # Development, deployment, and auto-commit automation
└── .github/workflows/  # CI/CD and security scanners
```

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL with `pgvector`
- Redis

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e .
cp ../.env.example .env
uvicorn app.main:app --reload --port 8000
```

### Auto-Commit Pipeline
This repository includes an automated checkpointing pipeline conforming to Conventional Commits and quality checks:
```bash
python scripts/auto_commit.py --type feat --scope backend --msg "initialize core application structure"
```
