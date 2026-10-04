"""Simulated customer-support agent pipeline with one real LLM generation step."""

from __future__ import annotations

import json
import secrets
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import Agent, Span, Trace
from app.services import llm as llm_service


def new_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(4)}"


INTENT_MAP = [
    ("password", "password_reset"),
    ("reset", "password_reset"),
    ("invoice", "billing_inquiry"),
    ("billing", "billing_inquiry"),
    ("cancel", "cancellation"),
    ("payment", "payment_issue"),
    ("failed", "payment_issue"),
    ("address", "account_update"),
]


KB_DOCS = {
    "password_reset": [
        {"title": "Password Reset Guide", "score": 0.94},
        {"title": "Account Security FAQ", "score": 0.88},
        {"title": "Two-Factor Authentication", "score": 0.76},
    ],
    "billing_inquiry": [
        {"title": "Billing FAQ", "score": 0.91},
        {"title": "Invoice Policy", "score": 0.87},
        {"title": "Subscription Pricing", "score": 0.82},
    ],
    "cancellation": [
        {"title": "Cancel Subscription", "score": 0.93},
        {"title": "Retention Offers", "score": 0.85},
        {"title": "Data Export Policy", "score": 0.71},
    ],
    "payment_issue": [
        {"title": "Failed Payments Troubleshooting", "score": 0.92},
        {"title": "Update Payment Method", "score": 0.89},
        {"title": "Billing Support Escalation", "score": 0.74},
    ],
    "account_update": [
        {"title": "Update Billing Address", "score": 0.90},
        {"title": "Account Profile Settings", "score": 0.84},
        {"title": "Tax ID Configuration", "score": 0.69},
    ],
    "general": [
        {"title": "Getting Started", "score": 0.78},
        {"title": "Contact Support", "score": 0.72},
        {"title": "Product Overview", "score": 0.65},
    ],
}


def classify_intent(text: str) -> str:
    lowered = text.lower()
    for keyword, intent in INTENT_MAP:
        if keyword in lowered:
            return intent
    return "general"


def run_agent_pipeline(
    db: Session,
    *,
    user_input: str,
    model: str = "gpt-4o-mini",
    agent_id: str | None = None,
) -> Trace:
    agent = None
    if agent_id:
        agent = db.get(Agent, agent_id)
    if agent is None:
        agent = db.query(Agent).first()
    if agent is None:
        raise ValueError("No agent configured. Run seed first.")

    started = datetime.now(timezone.utc)
    pipeline_t0 = time.perf_counter()
    trace_id = new_id("tr")
    root_id = new_id("sp")

    intent = classify_intent(user_input)
    docs = KB_DOCS.get(intent, KB_DOCS["general"])

    # Root agent span
    spans: list[Span] = []
    cursor = started

    def add_span(
        *,
        span_type: str,
        name: str,
        latency: int,
        inp: str,
        out: str,
        tokens: int = 0,
        cost: float = 0.0,
        status: str = "success",
        metadata: dict | None = None,
        parent_id: str | None = root_id,
    ) -> Span:
        nonlocal cursor
        s = Span(
            id=new_id("sp"),
            trace_id=trace_id,
            parent_id=parent_id,
            type=span_type,
            name=name,
            status=status,
            input=inp,
            output=out,
            latency_ms=latency,
            tokens=tokens,
            cost=cost,
            metadata_json=metadata or {},
            started_at=cursor,
            completed_at=cursor + timedelta(milliseconds=latency),
        )
        cursor = s.completed_at
        spans.append(s)
        return s

    root = Span(
        id=root_id,
        trace_id=trace_id,
        parent_id=None,
        type="agent",
        name=agent.name,
        status="running",
        input=user_input,
        output="",
        latency_ms=0,
        tokens=0,
        cost=0.0,
        metadata_json={"version": agent.version},
        started_at=started,
        completed_at=None,
    )
    spans.append(root)

    # 1. Intent classification (simulated LLM)
    add_span(
        span_type="llm",
        name="Intent Classification",
        latency=180 + (len(user_input) % 80),
        inp=user_input,
        out=json.dumps({"intent": intent, "confidence": 0.91}),
        tokens=120,
        cost=0.0002,
        metadata={"model": "gpt-4o-mini", "temperature": 0.0, "max_tokens": 100},
    )

    # 2. Retrieval
    add_span(
        span_type="retrieval",
        name="Knowledge Base Search",
        latency=140 + (hash(intent) % 60),
        inp=user_input,
        out=json.dumps({"documents": docs, "top_score": docs[0]["score"]}),
        metadata={"index": "support-kb-v3", "top_k": 3, "documents": docs},
    )

    # 3. Tool
    account = {
        "customer_id": "CUS-4821",
        "plan": "Premium",
        "status": "active",
        "billing_cycle": "monthly",
    }
    add_span(
        span_type="tool",
        name="Search Customer Account",
        latency=210 + (hash(user_input) % 90),
        inp=json.dumps({"customer_id": "CUS-4821"}),
        out=json.dumps(account),
        metadata={"tool": "search_customer_account", "arguments": {"customer_id": "CUS-4821"}},
    )

    # 4. Real (or mocked) response generation
    context_blob = (
        f"Intent: {intent}\n"
        f"Retrieved docs: {', '.join(d['title'] for d in docs)}\n"
        f"Customer plan: {account['plan']} ({account['status']})\n\n"
        f"User message: {user_input}"
    )
    llm_result = llm_service.generate(context_blob, model=model, temperature=0.2)
    add_span(
        span_type="llm",
        name="Response Generation",
        latency=llm_result.latency_ms,
        inp=context_blob,
        out=llm_result.content,
        tokens=llm_result.tokens,
        cost=llm_result.cost,
        metadata={
            "model": llm_result.model,
            "temperature": 0.2,
            "max_tokens": 800,
            "mocked": llm_result.mocked,
        },
    )

    # 5. Safety check
    add_span(
        span_type="llm",
        name="Safety Check",
        latency=160,
        inp=llm_result.content[:500],
        out=json.dumps({"safe": True, "flags": []}),
        tokens=60,
        cost=0.0001,
        metadata={"model": "gpt-4o-mini", "temperature": 0.0},
    )

    total_latency = int((time.perf_counter() - pipeline_t0) * 1000)
    # Prefer sum of span latencies for demo realism when LLM was mocked quickly
    span_sum = sum(s.latency_ms for s in spans if s.parent_id == root_id)
    total_latency = max(total_latency, span_sum)
    total_tokens = sum(s.tokens for s in spans)
    total_cost = round(sum(s.cost for s in spans), 6)
    completed = started + timedelta(milliseconds=total_latency)

    root.status = "success"
    root.output = llm_result.content
    root.latency_ms = total_latency
    root.tokens = total_tokens
    root.cost = total_cost
    root.completed_at = completed

    trace = Trace(
        id=trace_id,
        agent_id=agent.id,
        status="success",
        input=user_input,
        output=llm_result.content,
        latency_ms=total_latency,
        total_tokens=total_tokens,
        estimated_cost=total_cost,
        started_at=started,
        completed_at=completed,
    )
    db.add(trace)
    for s in spans:
        db.add(s)
    db.commit()
    db.refresh(trace)
    return trace
