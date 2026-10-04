from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Replay
from app.schemas import ReplayCreate, ReplayListResponse, ReplayOut
from app.services.replay import create_replay, enrich_replay

router = APIRouter(prefix="/replays", tags=["replays"])


@router.get("", response_model=ReplayListResponse)
def list_replays(db: Session = Depends(get_db)):
    rows = db.query(Replay).order_by(Replay.created_at.desc()).all()
    items = [ReplayOut(**enrich_replay(db, r)) for r in rows]
    return ReplayListResponse(items=items, total=len(items))


@router.get("/{replay_id}", response_model=ReplayOut)
def get_replay(replay_id: str, db: Session = Depends(get_db)):
    replay = db.get(Replay, replay_id)
    if not replay:
        raise HTTPException(status_code=404, detail="Replay not found")
    return ReplayOut(**enrich_replay(db, replay))


@router.post("", response_model=ReplayOut)
def post_replay(body: ReplayCreate, db: Session = Depends(get_db)):
    try:
        replay = create_replay(
            db,
            original_trace_id=body.original_trace_id,
            model=body.model,
            prompt_override=body.prompt_override,
            temperature=body.temperature,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ReplayOut(**enrich_replay(db, replay))
