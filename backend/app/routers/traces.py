from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Trace
from app.schemas import (
    RunAgentRequest,
    TraceDetail,
    TraceListItem,
    TraceListResponse,
)
from app.services.agent_runner import run_agent_pipeline

router = APIRouter(prefix="/traces", tags=["traces"])


def _latest_score(trace: Trace) -> float | None:
    if not trace.evaluations:
        return None
    return sorted(trace.evaluations, key=lambda e: e.created_at, reverse=True)[0].overall_score


@router.get("", response_model=TraceListResponse)
def list_traces(
    status: str | None = None,
    agent_id: str | None = None,
    q: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Trace).options(
        joinedload(Trace.agent),
        joinedload(Trace.evaluations),
    )
    if status:
        query = query.filter(Trace.status == status)
    if agent_id:
        query = query.filter(Trace.agent_id == agent_id)
    if q:
        like = f"%{q}%"
        query = query.filter(Trace.input.ilike(like) | Trace.id.ilike(like))

    total = query.count()
    traces = (
        query.order_by(Trace.started_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    items = [
        TraceListItem(
            id=t.id,
            agent_id=t.agent_id,
            agent_name=t.agent.name if t.agent else None,
            status=t.status,
            input=t.input,
            output=t.output,
            latency_ms=t.latency_ms,
            total_tokens=t.total_tokens,
            estimated_cost=t.estimated_cost,
            started_at=t.started_at,
            completed_at=t.completed_at,
            evaluation_score=_latest_score(t),
        )
        for t in traces
    ]
    return TraceListResponse(items=items, total=total)


@router.get("/{trace_id}", response_model=TraceDetail)
def get_trace(trace_id: str, db: Session = Depends(get_db)):
    trace = (
        db.query(Trace)
        .options(
            joinedload(Trace.agent),
            joinedload(Trace.spans),
            joinedload(Trace.evaluations),
        )
        .filter(Trace.id == trace_id)
        .first()
    )
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")

    evaluation = None
    if trace.evaluations:
        evaluation = sorted(trace.evaluations, key=lambda e: e.created_at, reverse=True)[0]

    spans = sorted(trace.spans, key=lambda s: s.started_at)
    return TraceDetail(
        id=trace.id,
        agent_id=trace.agent_id,
        agent=trace.agent,
        status=trace.status,
        input=trace.input,
        output=trace.output,
        latency_ms=trace.latency_ms,
        total_tokens=trace.total_tokens,
        estimated_cost=trace.estimated_cost,
        started_at=trace.started_at,
        completed_at=trace.completed_at,
        spans=[
            {
                "id": s.id,
                "trace_id": s.trace_id,
                "parent_id": s.parent_id,
                "type": s.type,
                "name": s.name,
                "status": s.status,
                "input": s.input,
                "output": s.output,
                "latency_ms": s.latency_ms,
                "tokens": s.tokens,
                "cost": s.cost,
                "metadata": s.metadata_json or {},
                "started_at": s.started_at,
                "completed_at": s.completed_at,
            }
            for s in spans
        ],
        evaluation=evaluation,
    )


@router.post("/run", response_model=TraceDetail)
def run_trace(body: RunAgentRequest, db: Session = Depends(get_db)):
    if not body.input.strip():
        raise HTTPException(status_code=400, detail="input is required")
    try:
        trace = run_agent_pipeline(
            db,
            user_input=body.input.strip(),
            model=body.model,
            agent_id=body.agent_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return get_trace(trace.id, db)
