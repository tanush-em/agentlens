# AgentLens

> AI Agent Observability & Evaluation Platform

A polished proof-of-concept for observing AI agent executions, inspecting LLM/tool/retrieval spans, evaluating quality, and replaying runs with different models or prompts.

## Features

- Agent execution tracing with span trees and timelines
- LLM / tool / retrieval observability
- Token and cost tracking
- Heuristic agent evaluation with scored dimensions
- Replay experiments and original-vs-replay comparison
- Live **Run Agent** flow (OpenAI-compatible LLM, with mock fallback)
- Light / dark theme with persisted preference
- Demo-data fallback when the API is unavailable

## Architecture

```text
Next.js (App Router + Tailwind)
   ↓
FastAPI
   ↓
SQLAlchemy + SQLite
   ↓
LLM Provider (OpenAI-compatible)
```

## Demo flow

```text
Run Agent → Trace Created → Inspect Execution → Evaluate → Replay → Compare
```

## Project structure

```text
agentlens/
├── frontend/          # Next.js App Router UI
├── backend/           # FastAPI + SQLAlchemy + SQLite
├── .env.example
├── README.md
└── spec.md
```

## Running locally

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env     # then set LLM_API_KEY if you want live runs
python -m app.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001).

> Default ports are **8001** (API) and **3001** (UI) to avoid clashes with services on 8000/3000.

### Seed database

```bash
cd backend
source .venv/bin/activate
python -m app.seed
```

Idempotent — safe to re-run.

## Environment variables

Root / backend (see `.env.example`):

```env
LLM_API_KEY=
LLM_MODEL=gpt-4.1-nano
DATABASE_URL=sqlite:///./agentlens.db
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3001
```

Frontend (`frontend/.env.local`, see `frontend/.env.example`):

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

## LLM configuration

Set `LLM_API_KEY` in `backend/.env` (and optionally root `.env`) to enable live **Run Agent** / **Replay**.

Default model is **`gpt-4.1-nano`**. Override with `LLM_MODEL`. Without a key, the backend uses deterministic mock responses.

Optional: `LLM_BASE_URL` for OpenAI-compatible providers.

## Demo walkthrough

1. Open the dashboard at `/` — KPI cards, charts, recent traces.
2. Open **Traces** — browse seeded Customer Support Agent runs.
3. Click a trace — execution tree, span details, timeline.
4. Click an LLM span — prompt, output, model, tokens, cost.
5. Click **Evaluate** — scores appear with reasoning.
6. Click **Replay** — change model/prompt and run.
7. Compare **Original vs Replay**.
8. Click **Run Agent** in the top bar — enter a support question; a new live/mocked trace is created.
9. Toggle light/dark mode from the top bar or **Settings → Appearance**.

## Known intentional limitations

- No auth, teams, billing, or multi-tenancy
- SQLite only (no Postgres/Redis)
- Intent / retrieval / tool / safety steps are simulated; only final response generation calls the LLM
- Dashboard chart series are seeded presentation data
- Most Settings fields are non-functional (theme preference works)
- Desktop-first layout (1024px+)
