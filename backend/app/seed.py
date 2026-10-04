"""Idempotent seed script: python -m app.seed"""

from __future__ import annotations

import json
import random
import secrets
from datetime import datetime, timedelta, timezone

from app.database import SessionLocal, init_db
from app.models import Agent, Evaluation, Replay, Span, Trace

AGENT_ID = "ag_csupport"
rng = random.Random(42)


QUESTIONS = [
    "How can I reset my password?",
    "Why was my invoice higher this month?",
    "I want to cancel my subscription.",
    "My payment failed.",
    "How do I change my billing address?",
    "Can I upgrade to the Enterprise plan?",
    "Where can I download my invoices?",
    "I was charged twice for last month.",
    "How do I enable two-factor authentication?",
    "My teammate can't access the workspace.",
    "What is included in the Premium plan?",
    "How long do you retain deleted data?",
    "I need a refund for unused seats.",
    "The webhook deliveries are failing.",
    "How do I rotate my API keys?",
    "Why am I seeing a usage limit warning?",
    "Can I change my billing cycle to annual?",
    "How do I export my conversation history?",
    "The SSO login keeps failing for our org.",
    "Is there an SLA for Premium customers?",
    "How do I add a secondary payment method?",
    "My invoice PDF won't download.",
    "Can you pause my subscription for a month?",
    "How do I invite a billing admin?",
    "What happens when my free trial ends?",
    "I need a VAT invoice for my company.",
    "Why did my discount code stop working?",
    "How do I close my account permanently?",
]


RESPONSES = {
    "password": "Please visit Settings → Security → Reset Password. A reset link will be emailed within a few minutes.",
    "invoice": "Your invoice increased due to add-on usage and the end of a promotional discount. I can break down each line item.",
    "cancel": "You can cancel from Billing → Subscription → Cancel. Access remains until the period ends.",
    "payment": "Payment failures are often caused by expired cards or bank declines. Update your method under Billing → Payment Methods.",
    "address": "Update your billing address under Billing → Billing Details. Changes apply to future invoices.",
    "default": "I've reviewed your account and our knowledge base. Here's the recommended next step based on your request.",
}


def pick_response(q: str) -> str:
    l = q.lower()
    for key in ("password", "invoice", "cancel", "payment", "address"):
        if key in l or (key == "invoice" and "billing" in l):
            return RESPONSES[key]
    return RESPONSES["default"] + f' Regarding "{q}", please check Settings or reply if you need escalation.'


def nid(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(3)}"


def seed():
    init_db()
    db = SessionLocal()
    try:
        existing = db.get(Agent, AGENT_ID)
        if existing and db.query(Trace).count() >= 20:
            print("Seed already present — skipping.")
            return

        # Clear for idempotent re-seed
        db.query(Replay).delete()
        db.query(Evaluation).delete()
        db.query(Span).delete()
        db.query(Trace).delete()
        db.query(Agent).delete()
        db.commit()

        agent = Agent(
            id=AGENT_ID,
            name="Customer Support Agent",
            description="Handles billing, account, and product support questions with retrieval + tools.",
            version="v1.4",
            created_at=datetime.now(timezone.utc) - timedelta(days=40),
        )
        db.add(agent)
        db.commit()

        now = datetime.now(timezone.utc)
        trace_ids: list[str] = []

        for i, question in enumerate(QUESTIONS):
            scenario = "success"
            if i in (3, 11):
                scenario = "tool_fail"
            elif i in (7, 18):
                scenario = "retrieval_fail"
            elif i in (5, 14):
                scenario = "slow"
            elif i in (8, 20):
                scenario = "expensive"
            elif i in (12, 22):
                scenario = "low_score"
            elif i == 25:
                scenario = "error"

            started = now - timedelta(hours=30 - i, minutes=rng.randint(0, 50))
            intent_lat = rng.randint(160, 420)
            retrieval_lat = rng.randint(120, 280)
            tool_lat = rng.randint(180, 360)
            response_lat = rng.randint(500, 1100)
            safety_lat = rng.randint(140, 260)

            if scenario == "slow":
                response_lat = rng.randint(2800, 4200)
            if scenario == "expensive":
                response_tokens = rng.randint(2800, 4200)
            else:
                response_tokens = rng.randint(700, 1400)

            status = "error" if scenario == "error" else "success"
            output = "" if scenario == "error" else pick_response(question)

            tool_status = "error" if scenario == "tool_fail" else "success"
            retrieval_status = "error" if scenario == "retrieval_fail" else "success"

            total_lat = intent_lat + retrieval_lat + tool_lat + response_lat + safety_lat
            total_tokens = 180 + 0 + 0 + response_tokens + 80
            cost = round(total_tokens * 0.0000045 + (0.012 if scenario == "expensive" else 0), 6)

            tid = f"tr_{secrets.token_hex(3)}"
            trace_ids.append(tid)
            root_id = nid("sp")
            cursor = started

            trace = Trace(
                id=tid,
                agent_id=AGENT_ID,
                status=status,
                input=question,
                output=output,
                latency_ms=total_lat,
                total_tokens=total_tokens,
                estimated_cost=cost,
                started_at=started,
                completed_at=started + timedelta(milliseconds=total_lat),
            )
            db.add(trace)

            def add(stype, name, lat, inp, out, tokens=0, c=0.0, st="success", meta=None, parent=root_id):
                nonlocal cursor
                s = Span(
                    id=nid("sp"),
                    trace_id=tid,
                    parent_id=parent,
                    type=stype,
                    name=name,
                    status=st,
                    input=inp,
                    output=out,
                    latency_ms=lat,
                    tokens=tokens,
                    cost=c,
                    metadata_json=meta or {},
                    started_at=cursor,
                    completed_at=cursor + timedelta(milliseconds=lat),
                )
                cursor = s.completed_at
                db.add(s)
                return s

            db.add(
                Span(
                    id=root_id,
                    trace_id=tid,
                    parent_id=None,
                    type="agent",
                    name="Customer Support Agent",
                    status=status,
                    input=question,
                    output=output,
                    latency_ms=total_lat,
                    tokens=total_tokens,
                    cost=cost,
                    metadata_json={"version": "v1.4"},
                    started_at=started,
                    completed_at=started + timedelta(milliseconds=total_lat),
                )
            )

            add(
                "llm",
                "Intent Classification",
                intent_lat,
                question,
                json.dumps({"intent": "support", "confidence": 0.9}),
                tokens=140,
                c=0.0002,
                meta={"model": "gpt-4o-mini", "temperature": 0.0, "max_tokens": 100},
            )
            docs = [
                {"title": "Billing FAQ", "score": 0.91},
                {"title": "Invoice Policy", "score": 0.87},
                {"title": "Subscription Pricing", "score": 0.82},
            ]
            add(
                "retrieval",
                "Knowledge Base Search",
                retrieval_lat,
                question,
                json.dumps({"documents": docs if retrieval_status == "success" else [], "top_score": 0.91 if retrieval_status == "success" else 0.0}),
                st=retrieval_status,
                meta={"index": "support-kb-v3", "top_k": 3, "documents": docs if retrieval_status == "success" else [], "top_score": 0.91 if retrieval_status == "success" else 0.0},
            )
            tool_out = {"customer_id": "CUS-4821", "plan": "Premium", "status": "active"}
            add(
                "tool",
                "Search Customer Account",
                tool_lat,
                json.dumps({"customer_id": "CUS-4821"}),
                json.dumps(tool_out if tool_status == "success" else {"error": "timeout"}),
                st=tool_status,
                meta={"tool": "search_customer_account", "arguments": {"customer_id": "CUS-4821"}},
            )
            add(
                "llm",
                "Response Generation",
                response_lat,
                question,
                output or "Unable to generate response due to upstream failure.",
                tokens=response_tokens,
                c=round(response_tokens * 0.000004, 6),
                st="error" if scenario == "error" else "success",
                meta={"model": "gpt-4o-mini", "temperature": 0.2, "max_tokens": 800, "prompt": f"You are a support agent.\n\nUser: {question}"},
            )
            add(
                "llm",
                "Safety Check",
                safety_lat,
                output[:200] if output else "",
                json.dumps({"safe": scenario != "error", "flags": []}),
                tokens=60,
                c=0.0001,
                meta={"model": "gpt-4o-mini", "temperature": 0.0},
            )

        db.commit()

        # Evaluations for a subset
        eval_indices = list(range(0, 20, 2))[:12]
        for idx in eval_indices:
            tid = trace_ids[idx]
            low = idx in (12, 22) or QUESTIONS[idx] == QUESTIONS[12]
            base = 0.72 if low else 0.90 + rng.random() * 0.08
            if "fail" in QUESTIONS[idx].lower():
                base = max(base, 0.85)
            faithfulness = round(min(0.99, base + 0.02), 4)
            relevance = round(min(0.99, base), 4)
            tool_accuracy = 0.45 if idx in (3, 11) else 1.0
            task_completion = round(min(0.99, base + 0.01), 4)
            overall = round(
                faithfulness * 0.3 + relevance * 0.25 + tool_accuracy * 0.2 + task_completion * 0.25,
                4,
            )
            db.add(
                Evaluation(
                    id=nid("ev"),
                    trace_id=tid,
                    faithfulness=faithfulness,
                    relevance=relevance,
                    tool_accuracy=tool_accuracy,
                    task_completion=task_completion,
                    overall_score=overall,
                    reasoning=(
                        "The response directly addresses the user question and uses retrieved context. "
                        if overall > 0.85
                        else "Partial success; some tool or retrieval issues reduced overall quality."
                    ),
                    created_at=now - timedelta(hours=20 - idx),
                )
            )
        db.commit()

        # Replays
        for i, tid in enumerate(trace_ids[:8]):
            original = db.get(Trace, tid)
            score = 0.94 + rng.random() * 0.04
            db.add(
                Replay(
                    id=nid("rp"),
                    original_trace_id=tid,
                    model="gpt-4.1-mini" if i % 2 else "gpt-4o-mini",
                    prompt_override="Be more concise and lead with the concrete next step." if i % 3 == 0 else "",
                    output=(
                        original.output
                        + " Additionally, I've attached a short checklist so you can resolve this faster."
                        if original and original.output
                        else "Replay response unavailable."
                    ),
                    latency_ms=int((original.latency_ms if original else 1200) * 0.78),
                    tokens=int((original.total_tokens if original else 1000) * 0.85),
                    cost=round((original.estimated_cost if original else 0.008) * 0.75, 6),
                    evaluation_score=round(score, 4),
                    created_at=now - timedelta(hours=10 - i),
                )
            )
        db.commit()

        print(
            f"Seeded: 1 agent, {len(QUESTIONS)} traces, "
            f"{db.query(Span).count()} spans, "
            f"{db.query(Evaluation).count()} evaluations, "
            f"{db.query(Replay).count()} replays"
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
