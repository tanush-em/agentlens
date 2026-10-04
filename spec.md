# AgentLens — Rapid POC Build Pack

## 0. ROLE

You are a senior full-stack AI engineer building a polished portfolio-grade proof of concept called **AgentLens**.

Your job is NOT to build a production SaaS platform.

Your job is to build a **small, convincing, technically real AI observability + evaluation POC** that can be completed quickly and demonstrated in 5–10 minutes.

The application should LOOK like a serious developer tool / AI infrastructure product while keeping the implementation intentionally lightweight.

Prioritize:

1. Working end-to-end functionality
2. Excellent UI/UX
3. Clear architecture
4. Real backend + database
5. One real LLM integration
6. Real trace persistence
7. Real evaluation/replay flow
8. Seeded demo data for everything else

Avoid unnecessary infrastructure and enterprise complexity.

---

# 1. PRODUCT

## Name

**AgentLens**

## One-line description

> AI Agent Observability & Evaluation Platform

## Product promise

AgentLens lets developers:

* observe AI agent executions
* inspect LLM/tool/retrieval steps
* understand latency and cost
* evaluate agent quality
* replay executions with different models/prompts
* compare original and replayed results

The core product question is:

> **Can I observe, understand, evaluate, and replay one AI agent?**

---

# 2. IMPORTANT SCOPE RULE

This is a POC.

Do NOT build:

* authentication
* RBAC
* teams
* organizations
* billing
* subscriptions
* PostgreSQL
* Redis
* Kubernetes
* Docker orchestration
* OpenTelemetry collector infrastructure
* distributed tracing infrastructure
* message queues
* microservices
* plugin marketplace
* Slack integrations
* production deployment infrastructure
* complex dataset management
* real-time collaboration
* multi-tenancy
* advanced permissions
* elaborate agent SDK

If something would take significant time but is primarily visual, use realistic seeded/mock data.

The application should have roughly:

**40% genuinely functional engineering + 60% polished product presentation.**

---

# 3. TECH STACK

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide icons
* Recharts or another lightweight charting library

Use the App Router.

## Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy

## Database

Use:

**SQLite**

Development database:

```text
agentlens.db
```

No PostgreSQL.

## LLM

Integrate ONE real LLM provider.

Prefer an OpenAI-compatible API abstraction so the provider can be swapped later.

Environment variables:

```env
LLM_API_KEY=
LLM_MODEL=
```

Do not hardcode API keys.

If the API key is unavailable, the application must still run using seeded/demo data.

---

# 4. REPOSITORY STRUCTURE

Use a simple monorepo:

```text
agentlens/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   ├── routers/
│   │   │   ├── traces.py
│   │   │   ├── evaluations.py
│   │   │   └── replays.py
│   │   └── services/
│   │       ├── llm.py
│   │       ├── evaluation.py
│   │       └── replay.py
│   └── requirements.txt
│
├── README.md
└── .env.example
```

Keep the architecture simple.

---

# 5. CORE DATABASE MODEL

Create a small SQLite schema.

## Agent

```text
Agent
- id
- name
- description
- version
- created_at
```

Example:

```text
Customer Support Agent
Version: v1.4
```

## Trace

```text
Trace
- id
- agent_id
- status
- input
- output
- latency_ms
- total_tokens
- estimated_cost
- started_at
- completed_at
```

Statuses:

```text
success
error
running
```

## Span

A trace contains multiple spans.

```text
Span
- id
- trace_id
- parent_id
- type
- name
- status
- input
- output
- latency_ms
- tokens
- cost
- metadata
- started_at
- completed_at
```

Span types:

```text
agent
llm
tool
retrieval
```

## Evaluation

```text
Evaluation
- id
- trace_id
- faithfulness
- relevance
- tool_accuracy
- task_completion
- overall_score
- reasoning
- created_at
```

## Replay

```text
Replay
- id
- original_trace_id
- model
- prompt_override
- output
- latency_ms
- tokens
- cost
- evaluation_score
- created_at
```

Do not over-normalize the database.

---

# 6. SEED DATA

The application must look populated immediately after startup.

Create realistic seeded data.

Use approximately:

```text
1 Agent
20–30 Traces
60–100 Spans
10–15 Evaluations
5–10 Replay records
```

Primary agent:

# Customer Support Agent

Example user questions:

```text
How can I reset my password?
Why was my invoice higher this month?
I want to cancel my subscription.
My payment failed.
How do I change my billing address?
```

Create realistic execution trees.

Example:

```text
Customer Support Agent
│
├── LLM: Intent Classification
│
├── Retrieval: Knowledge Base Search
│
├── Tool: Search Customer Account
│
├── LLM: Response Generation
│
└── LLM: Safety Check
```

Some traces should be:

* successful
* slow
* expensive
* low evaluation score
* tool failure
* retrieval failure

This makes the dashboard feel real.

---

# 7. APPLICATION ROUTES

Build these routes:

```text
/
 /traces
 /traces/[id]
 /evaluations
 /replays
```

Do NOT build unnecessary pages.

The landing route `/` is the main dashboard.

---

# 8. GLOBAL UI DESIGN

The product should resemble a modern developer infrastructure platform.

Visual direction:

* dark-first interface
* extremely clean
* minimal gradients
* subtle borders
* compact typography
* high information density
* developer-tool aesthetic
* excellent spacing
* restrained animations
* no giant marketing hero section

Think:

```text
Linear
Vercel
Datadog
LangSmith
OpenAI developer tooling
```

but do NOT copy any one product.

Use a persistent sidebar.

Sidebar:

```text
AGENTLENS

Overview

OBSERVABILITY
  Traces
  Evaluations

EXPERIMENTATION
  Replays

SYSTEM
  Settings
```

Settings can be non-functional.

---

# 9. TOP NAVIGATION

Top bar:

```text
AgentLens / Overview

Customer Support Agent ▾

[Search]          [Run Agent]       ● Connected
```

The "Run Agent" button should actually work.

---

# 10. DASHBOARD

Route:

```text
/
```

Title:

```text
Agent Overview
```

Subtitle:

```text
Monitor agent performance, quality, and execution behavior.
```

## KPI cards

Display:

```text
Total Runs
2,481

Success Rate
96.8%

Avg Latency
1.84s

Avg Cost
$0.0084

Faithfulness
94.2%
```

Use realistic seeded values.

Include trend indicators.

---

# 11. DASHBOARD CHARTS

Create polished charts.

## Run volume

Line chart:

```text
Runs over time
```

## Latency

Area/line chart:

```text
Average latency
```

## Quality

Line chart:

```text
Evaluation score
```

## Cost

Bar/line chart:

```text
Cost per run
```

Charts can use seeded data.

They do not need to be generated dynamically from every database record.

---

# 12. RECENT TRACES

Dashboard should include a table:

```text
Recent Traces
```

Columns:

```text
Status
Trace
Input
Latency
Tokens
Cost
Score
Time
```

Example:

```text
✓  tr_8f91a
"Why was my invoice..."
1.72s
1,842
$0.008
94
2m ago
```

Clicking a row opens:

```text
/traces/[id]
```

---

# 13. TRACES PAGE

Route:

```text
/traces
```

Title:

```text
Trace Explorer
```

Subtitle:

```text
Inspect individual agent executions and understand exactly what happened.
```

Add:

* search
* status filter
* agent filter
* date filter
* latency filter

These filters may operate only on currently loaded data.

Main table:

```text
Status
Trace ID
Agent
Input
Duration
Tokens
Cost
Evaluation
Timestamp
```

---

# 14. TRACE DETAIL PAGE

This is the MOST IMPORTANT SCREEN.

Make it extremely polished.

Route:

```text
/traces/[id]
```

Header:

```text
← Traces

Trace tr_8f91a

Customer Support Agent
Completed successfully

1.72s
1,842 tokens
$0.008
Score 94
```

Buttons:

```text
Evaluate
Replay
```

---

# 15. TRACE EXECUTION TREE

Create a visually impressive execution tree.

Example:

```text
Customer Support Agent
│
├── Intent Classification
│      LLM
│      420ms
│
├── Knowledge Base Search
│      RETRIEVAL
│      180ms
│
├── Customer Lookup
│      TOOL
│      230ms
│
├── Response Generation
│      LLM
│      690ms
│
└── Safety Check
       LLM
       200ms
```

Each span is clickable.

Clicking a span updates the details panel.

---

# 16. SPAN DETAILS PANEL

When an LLM span is selected, show:

```text
LLM Call

Model
gpt-4o-mini

Latency
690ms

Tokens
1,120

Cost
$0.0048

Prompt
...

Output
...

Metadata
temperature: 0.2
max_tokens: 800
```

When a tool span is selected:

```text
Tool Call

search_customer_account

Arguments
{
  "customer_id": "CUS-4821"
}

Result
{
  "plan": "Premium",
  "status": "active"
}

Latency
230ms
```

When retrieval is selected:

```text
Retrieval

Knowledge Base Search

Query
"invoice higher this month"

Top Documents

1. Billing FAQ
2. Invoice Policy
3. Subscription Pricing

Top Score
0.91
```

---

# 17. TRACE TIMELINE

Below the execution tree, show a timeline.

Example:

```text
0ms                 500ms              1000ms              1700ms
|---------------------|-------------------|-------------------|

Intent       █████
Retrieval         ███
Tool                  █████
Response                   ███████████
Safety                                ████
```

This can be visual-only using seeded span timing.

---

# 18. EVALUATION PAGE

Route:

```text
/evaluations
```

Title:

```text
Evaluation Center
```

Subtitle:

```text
Measure the quality and reliability of your agent runs.
```

KPI cards:

```text
Overall Quality     93.4
Faithfulness        95.1
Relevance           92.8
Tool Accuracy       97.2
Task Completion     94.6
```

Create evaluation history table.

Columns:

```text
Trace
Faithfulness
Relevance
Tool Accuracy
Completion
Overall
```

Use score badges.

---

# 19. EVALUATE ACTION

On Trace Detail, the "Evaluate" button must work.

Clicking it:

```text
POST /evaluations
```

Backend evaluates the trace.

For the POC, evaluation logic can be lightweight.

Use a deterministic scoring layer based on:

* presence of output
* successful spans
* retrieval results
* tool success
* latency
* optional LLM judge

If LLM is available, optionally ask the model to judge:

```text
faithfulness
relevance
task completion
```

Return structured JSON.

Example:

```json
{
  "faithfulness": 0.95,
  "relevance": 0.92,
  "tool_accuracy": 1.0,
  "task_completion": 0.96,
  "overall_score": 0.95,
  "reasoning": "The response directly addresses the billing issue and uses relevant retrieved context."
}
```

Update the UI immediately.

---

# 20. REPLAY PAGE

Route:

```text
/replays
```

Title:

```text
Replay Lab
```

Subtitle:

```text
Re-run agent executions with different models or prompts.
```

Show existing replay experiments.

Button:

```text
New Replay
```

---

# 21. REPLAY FLOW

From Trace Detail:

```text
Replay
```

opens a replay panel/modal.

Show:

```text
Original Run

Model
gpt-4o-mini

Prompt
Default Agent Prompt
```

Controls:

```text
Model
[ gpt-4o-mini ▼ ]

Prompt Override
[ textarea ]

Temperature
[ 0.2 ]

Run Replay
```

Allow models:

```text
gpt-4o-mini
gpt-4.1-mini
```

Do not require both models to actually exist.

If a real LLM API is configured, execute the replay.

Otherwise use a deterministic mocked replay result.

---

# 22. REPLAY COMPARISON

After replay:

```text
Original vs Replay
```

Two-column layout.

### Original

```text
Model
gpt-4o-mini

Latency
1.72s

Tokens
1,842

Cost
$0.008

Score
94
```

### Replay

```text
Model
gpt-4.1-mini

Latency
1.31s

Tokens
1,521

Cost
$0.006

Score
97
```

Below:

```text
Quality
██████████████████ 94
████████████████████ 97
```

And:

```text
Response Difference

Original:
...

Replay:
...

Key Changes:
- More concise response
- Better billing explanation
- Lower token usage
```

This screen should feel like a real AI experimentation tool.

---

# 23. RUN AGENT BUTTON

The top navigation contains:

```text
Run Agent
```

This should open a modal.

Fields:

```text
Agent
Customer Support Agent

User Message
[ textarea ]

Model
[ gpt-4o-mini ]

Run
```

When submitted:

```text
POST /traces/run
```

Backend:

1. create trace
2. call LLM
3. generate simulated retrieval/tool spans
4. generate final response
5. calculate latency
6. calculate token usage if available
7. calculate estimated cost
8. store everything in SQLite
9. return trace

Frontend then navigates to:

```text
/traces/[new_trace_id]
```

This is the most important genuinely functional flow.

---

# 24. SIMULATED AGENT EXECUTION

Do NOT build a sophisticated autonomous agent.

The POC agent can follow a deterministic pipeline:

```text
User Input
    ↓
Intent Classification
    ↓
Knowledge Base Retrieval
    ↓
Customer Tool
    ↓
Response Generation
    ↓
Safety Check
```

Only the final LLM generation needs to be genuinely powered by an LLM.

The other steps can be deterministic/simulated but must generate realistic spans.

This creates the illusion of a real agent execution while keeping implementation extremely manageable.

---

# 25. BACKEND API

Implement:

```text
GET /health

GET /agents

GET /traces

GET /traces/{trace_id}

POST /traces/run

GET /evaluations

POST /evaluations

GET /replays

POST /replays

GET /replays/{replay_id}
```

Return clean Pydantic response models.

---

# 26. API EXAMPLES

## GET /traces

```json
{
  "items": [],
  "total": 30
}
```

## GET /traces/{id}

Return:

```json
{
  "id": "tr_8f91a",
  "agent": {},
  "input": "...",
  "output": "...",
  "latency_ms": 1720,
  "tokens": 1842,
  "cost": 0.008,
  "status": "success",
  "spans": []
}
```

---

# 27. FRONTEND API LAYER

Do not scatter fetch calls throughout components.

Create:

```text
frontend/lib/api.ts
```

Expose functions:

```typescript
getTraces()
getTrace(id)
runAgent(input)
getEvaluations()
evaluateTrace(id)
getReplays()
createReplay(...)
```

Use TypeScript types.

---

# 28. MOCK FALLBACK

The application MUST remain visually usable if:

* backend is unavailable
* LLM API key is missing
* evaluation provider is unavailable

However:

Do NOT fake the existence of backend functionality when the backend is available.

Use:

```text
NEXT_PUBLIC_API_URL
```

for the API.

If API requests fail, display a subtle:

```text
Demo data
```

indicator and use local fallback data.

---

# 29. COMPONENT ARCHITECTURE

Create reusable components:

```text
Sidebar
TopBar
KpiCard
TraceTable
StatusBadge
ScoreBadge
TraceTree
SpanDetails
TraceTimeline
MetricChart
EvaluationCard
EvaluationTable
ReplayPanel
ComparisonCard
EmptyState
LoadingState
```

Do not create huge monolithic page components.

---

# 30. IMPORTANT UI DETAIL

The application should NEVER look like a generic dashboard template.

Use:

* meaningful labels
* realistic IDs
* realistic timestamps
* believable token counts
* believable costs
* believable model names
* realistic prompts
* realistic tool arguments
* realistic evaluation explanations

Avoid:

```text
Lorem ipsum
Test User
123
Sample Data
Chart 1
Metric 1
```

---

# 31. MICRO-INTERACTIONS

Add subtle polish:

* sidebar active state
* hover states
* row hover
* smooth modal transitions
* skeleton loading
* copy trace ID button
* copy prompt button
* expandable JSON
* score animations
* tooltips
* toast after evaluation
* toast after replay
* loading state during real LLM run

Do NOT over-animate.

---

# 32. RESPONSIVENESS

Desktop is the primary target.

Support:

* 1440px
* 1280px
* 1024px

Mobile does not need to be perfect.

---

# 33. EMPTY / ERROR STATES

Implement polished states for:

```text
No traces
No evaluations
Replay failed
LLM unavailable
Backend unavailable
Invalid trace
```

Never expose raw Python stack traces to the UI.

---

# 34. SEED SCRIPT

Create:

```text
python -m app.seed
```

It should:

1. initialize database
2. create agent
3. create traces
4. create spans
5. create evaluations
6. create replays

Make it idempotent.

---

# 35. DEVELOPMENT COMMANDS

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Document Windows equivalents where appropriate.

---

# 36. ENVIRONMENT

Create:

```text
.env.example
```

with:

```env
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini

DATABASE_URL=sqlite:///./agentlens.db

CORS_ORIGINS=http://localhost:3000
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

# 37. README

Create a professional README.

Include:

## AgentLens

> AI Agent Observability & Evaluation Platform

### Features

* Agent execution tracing
* LLM observability
* Tool/retrieval visibility
* Token and cost tracking
* Agent evaluation
* Replay experiments
* Model comparison

### Architecture

```text
Next.js
   ↓
FastAPI
   ↓
SQLAlchemy
   ↓
SQLite
   ↓
LLM Provider
```

### Demo

Explain the primary flow:

```text
Run Agent
→ Trace Created
→ Inspect Execution
→ Evaluate
→ Replay
→ Compare
```

### Project Structure

Show repository tree.

### Running Locally

Give exact commands.

---

# 38. IMPLEMENTATION ORDER

DO NOT attempt everything simultaneously.

Build in this exact order.

## Phase 1 — Skeleton

Create:

* monorepo
* Next.js
* FastAPI
* SQLite
* SQLAlchemy
* CORS
* basic sidebar

Verify both servers start.

---

## Phase 2 — Database + Seed

Implement:

* Agent
* Trace
* Span
* Evaluation
* Replay

Implement seed script.

Verify SQLite contains realistic data.

---

## Phase 3 — Trace Explorer

Implement:

```text
GET /traces
GET /traces/{id}
```

Build:

```text
/traces
/traces/[id]
```

Get this working completely before moving on.

---

## Phase 4 — Polish Trace UI

Make Trace Detail excellent.

Implement:

* execution tree
* span selection
* span details
* timeline
* token/cost display

This is the primary portfolio screen.

---

## Phase 5 — Dashboard

Implement:

* KPI cards
* charts
* recent traces
* navigation

Use seeded data.

---

## Phase 6 — Evaluation

Implement:

```text
POST /evaluations
```

Add Evaluate button.

Update evaluation UI.

---

## Phase 7 — Real Agent Run

Implement:

```text
POST /traces/run
```

Connect one LLM provider.

Pipeline:

```text
input
→ simulated intent
→ simulated retrieval
→ simulated tool
→ real LLM
→ simulated safety check
→ trace persistence
```

---

## Phase 8 — Replay

Implement:

```text
POST /replays
```

Create replay UI.

Add comparison screen.

---

## Phase 9 — Final Polish

Fix:

* spacing
* typography
* empty states
* loading states
* error states
* animations
* responsive layout
* README
* environment configuration

---

# 39. DEFINITION OF DONE

The POC is complete when I can perform this exact demonstration:

### Step 1

Open:

```text
http://localhost:3000
```

See polished AgentLens dashboard.

### Step 2

Open:

```text
Traces
```

See realistic execution history.

### Step 3

Click a trace.

See:

```text
Agent
→ LLM
→ Retrieval
→ Tool
→ LLM
```

### Step 4

Click an LLM span.

See:

```text
Prompt
Output
Model
Tokens
Latency
Cost
```

### Step 5

Click:

```text
Evaluate
```

See evaluation scores.

### Step 6

Click:

```text
Replay
```

Change model or prompt.

### Step 7

Run replay.

See:

```text
Original vs Replay
```

with:

```text
Latency
Tokens
Cost
Quality
Output
```

### Step 8

Click:

```text
Run Agent
```

Enter a new customer-support question.

The application makes a real LLM call.

A new trace appears.

That is the complete demo.

---

# 40. WHAT NOT TO DO

If you find yourself implementing any of these, STOP and simplify:

```text
Redis
PostgreSQL
Kafka
Celery
Kubernetes
Docker Compose
OpenTelemetry Collector
distributed tracing
auth
RBAC
multi-tenancy
billing
webhooks
OAuth
complex LangGraph orchestration
vector database
advanced RAG pipeline
agent marketplace
```

None of these are necessary for this POC.

---

# 41. DESIGN PRINCIPLE

The application should communicate:

> "This could become a serious AI infrastructure product."

It does NOT need to actually BE a serious production infrastructure product yet.

The implementation should be honest:

* real backend
* real database
* real API
* real LLM call
* real persistence
* real evaluation/replay flow
* seeded realistic data
* polished frontend

Everything else can be simplified.

---

# 42. FINAL INSTRUCTION TO THE CODING AGENT

Before writing code:

1. Inspect the repository.
2. Create the proposed structure.
3. Do not ask unnecessary questions.
4. Make sensible defaults.
5. Keep the implementation small.
6. Prioritize the end-to-end demo path.
7. Do not introduce infrastructure that is not explicitly required above.
8. Keep components modular.
9. Keep API contracts typed.
10. Make the application runnable locally.

Then implement the project **phase by phase in the order specified above**.

After each phase, verify that the application still runs.

Do not prematurely implement later phases.

When complete, provide:

```text
1. What was implemented
2. How to run frontend
3. How to run backend
4. How to seed database
5. Environment variables required
6. LLM configuration
7. Demo walkthrough
8. Known intentional limitations
```

The final result should feel like a **small but highly polished AI developer platform**, not a toy CRUD application.
