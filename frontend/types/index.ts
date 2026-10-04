export type Agent = {
  id: string;
  name: string;
  description: string;
  version: string;
  created_at: string;
};

export type Span = {
  id: string;
  trace_id: string;
  parent_id: string | null;
  type: "agent" | "llm" | "tool" | "retrieval" | string;
  name: string;
  status: string;
  input: string;
  output: string;
  latency_ms: number;
  tokens: number;
  cost: number;
  metadata: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
};

export type Evaluation = {
  id: string;
  trace_id: string;
  faithfulness: number;
  relevance: number;
  tool_accuracy: number;
  task_completion: number;
  overall_score: number;
  reasoning: string;
  created_at: string;
};

export type TraceListItem = {
  id: string;
  agent_id: string;
  agent_name?: string | null;
  status: string;
  input: string;
  output: string;
  latency_ms: number;
  total_tokens: number;
  estimated_cost: number;
  started_at: string;
  completed_at: string | null;
  evaluation_score?: number | null;
};

export type TraceDetail = {
  id: string;
  agent_id: string;
  agent?: Agent | null;
  status: string;
  input: string;
  output: string;
  latency_ms: number;
  total_tokens: number;
  estimated_cost: number;
  started_at: string;
  completed_at: string | null;
  spans: Span[];
  evaluation?: Evaluation | null;
};

export type Replay = {
  id: string;
  original_trace_id: string;
  model: string;
  prompt_override: string;
  output: string;
  latency_ms: number;
  tokens: number;
  cost: number;
  evaluation_score: number;
  created_at: string;
  original_input?: string | null;
  original_output?: string | null;
  original_latency_ms?: number | null;
  original_tokens?: number | null;
  original_cost?: number | null;
  original_score?: number | null;
};
