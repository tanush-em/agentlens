import type {
  Agent,
  Evaluation,
  Replay,
  TraceDetail,
  TraceListItem,
} from "@/types";
import { demoAgents, demoEvaluations, demoReplays, demoTraces, getDemoTrace } from "@/lib/demo-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

export type ApiResult<T> = { data: T; demo: boolean };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<ApiResult<T>> {
  try {
    const data = await fn();
    return { data, demo: false };
  } catch {
    return { data: fallback, demo: true };
  }
}

export async function getAgents(): Promise<ApiResult<Agent[]>> {
  return withFallback(() => request<Agent[]>("/agents"), demoAgents);
}

export async function getTraces(params?: {
  q?: string;
  status?: string;
}): Promise<ApiResult<{ items: TraceListItem[]; total: number }>> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  const qs = sp.toString();
  return withFallback(
    () => request<{ items: TraceListItem[]; total: number }>(`/traces${qs ? `?${qs}` : ""}`),
    { items: demoTraces, total: demoTraces.length },
  );
}

export async function getTrace(id: string): Promise<ApiResult<TraceDetail>> {
  return withFallback(() => request<TraceDetail>(`/traces/${id}`), getDemoTrace(id));
}

export async function runAgent(input: string, model = "gpt-4o-mini"): Promise<ApiResult<TraceDetail>> {
  try {
    const data = await request<TraceDetail>("/traces/run", {
      method: "POST",
      body: JSON.stringify({ input, model }),
    });
    return { data, demo: false };
  } catch (err) {
    throw err;
  }
}

export async function getEvaluations(): Promise<
  ApiResult<{ items: Evaluation[]; total: number; averages: Record<string, number> }>
> {
  return withFallback(
    () =>
      request<{ items: Evaluation[]; total: number; averages: Record<string, number> }>(
        "/evaluations",
      ),
    {
      items: demoEvaluations,
      total: demoEvaluations.length,
      averages: {
        overall_score: 93.4,
        faithfulness: 95.1,
        relevance: 92.8,
        tool_accuracy: 97.2,
        task_completion: 94.6,
      },
    },
  );
}

export async function evaluateTrace(traceId: string): Promise<ApiResult<Evaluation>> {
  const data = await request<Evaluation>("/evaluations", {
    method: "POST",
    body: JSON.stringify({ trace_id: traceId }),
  });
  return { data, demo: false };
}

export async function getReplays(): Promise<ApiResult<{ items: Replay[]; total: number }>> {
  return withFallback(
    () => request<{ items: Replay[]; total: number }>("/replays"),
    { items: demoReplays, total: demoReplays.length },
  );
}

export async function getReplay(id: string): Promise<ApiResult<Replay>> {
  return withFallback(
    () => request<Replay>(`/replays/${id}`),
    demoReplays.find((r) => r.id === id) || demoReplays[0],
  );
}

export async function createReplay(body: {
  original_trace_id: string;
  model: string;
  prompt_override?: string;
  temperature?: number;
}): Promise<ApiResult<Replay>> {
  const data = await request<Replay>("/replays", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { data, demo: false };
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return "—";
  const v = score <= 1 ? score * 100 : score;
  return Math.round(v).toString();
}

export function formatTokens(n: number): string {
  return n.toLocaleString();
}
