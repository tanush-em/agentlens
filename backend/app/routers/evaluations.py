from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Evaluation
from app.schemas import EvaluationCreate, EvaluationListResponse, EvaluationOut
from app.services.evaluation import evaluate_trace

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("", response_model=EvaluationListResponse)
def list_evaluations(db: Session = Depends(get_db)):
    items = db.query(Evaluation).order_by(Evaluation.created_at.desc()).all()
    averages = {
        "overall_score": 0.0,
        "faithfulness": 0.0,
        "relevance": 0.0,
        "tool_accuracy": 0.0,
        "task_completion": 0.0,
    }
    if items:
        averages = {
            "overall_score": round(sum(i.overall_score for i in items) / len(items) * 100, 1),
            "faithfulness": round(sum(i.faithfulness for i in items) / len(items) * 100, 1),
            "relevance": round(sum(i.relevance for i in items) / len(items) * 100, 1),
            "tool_accuracy": round(sum(i.tool_accuracy for i in items) / len(items) * 100, 1),
            "task_completion": round(sum(i.task_completion for i in items) / len(items) * 100, 1),
        }
    return EvaluationListResponse(items=items, total=len(items), averages=averages)


@router.post("", response_model=EvaluationOut)
def create_evaluation(body: EvaluationCreate, db: Session = Depends(get_db)):
    try:
        return evaluate_trace(db, body.trace_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
