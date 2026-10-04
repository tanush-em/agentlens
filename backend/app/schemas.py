from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AgentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    version: str
    created_at: datetime


class SpanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    trace_id: str
    parent_id: str | None = None
    type: str
    name: str
    status: str
    input: str
    output: str
    latency_ms: int
    tokens: int
    cost: float
    metadata: dict[str, Any] = Field(default_factory=dict, validation_alias="metadata_json")
    started_at: datetime
    completed_at: datetime | None = None


class EvaluationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    trace_id: str
    faithfulness: float
    relevance: float
    tool_accuracy: float
    task_completion: float
    overall_score: float
    reasoning: str
    created_at: datetime


class TraceListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_id: str
    agent_name: str | None = None
    status: str
    input: str
    output: str
    latency_ms: int
    total_tokens: int
    estimated_cost: float
    started_at: datetime
    completed_at: datetime | None = None
    evaluation_score: float | None = None


class TraceDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_id: str
    agent: AgentOut | None = None
    status: str
    input: str
    output: str
    latency_ms: int
    total_tokens: int
    estimated_cost: float
    started_at: datetime
    completed_at: datetime | None = None
    spans: list[SpanOut] = Field(default_factory=list)
    evaluation: EvaluationOut | None = None


class TraceListResponse(BaseModel):
    items: list[TraceListItem]
    total: int


class RunAgentRequest(BaseModel):
    input: str
    model: str = "gpt-4o-mini"
    agent_id: str | None = None


class EvaluationCreate(BaseModel):
    trace_id: str


class EvaluationListResponse(BaseModel):
    items: list[EvaluationOut]
    total: int
    averages: dict[str, float] = Field(default_factory=dict)


class ReplayOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    original_trace_id: str
    model: str
    prompt_override: str
    output: str
    latency_ms: int
    tokens: int
    cost: float
    evaluation_score: float
    created_at: datetime
    original_input: str | None = None
    original_output: str | None = None
    original_latency_ms: int | None = None
    original_tokens: int | None = None
    original_cost: float | None = None
    original_score: float | None = None


class ReplayCreate(BaseModel):
    original_trace_id: str
    model: str = "gpt-4o-mini"
    prompt_override: str = ""
    temperature: float = 0.2


class ReplayListResponse(BaseModel):
    items: list[ReplayOut]
    total: int


class DashboardStats(BaseModel):
    total_runs: int
    success_rate: float
    avg_latency_ms: float
    avg_cost: float
    avg_faithfulness: float
    charts: dict[str, list[dict[str, Any]]] = Field(default_factory=dict)
