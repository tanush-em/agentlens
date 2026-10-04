"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScoreBadge, StatusBadge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/primitives";
import { TraceTree } from "@/components/TraceTree";
import { SpanDetails } from "@/components/SpanDetails";
import { TraceTimeline } from "@/components/TraceTimeline";
import { ReplayPanel } from "@/components/ReplayPanel";
import {
  createReplay,
  evaluateTrace,
  formatCost,
  formatLatency,
  formatScore,
  formatTokens,
  getTrace,
} from "@/lib/api";
import type { Span, TraceDetail } from "@/types";

export default function TraceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trace, setTrace] = useState<TraceDetail | null>(null);
  const [selected, setSelected] = useState<Span | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [replayOpen, setReplayOpen] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTrace(params.id)
      .then((res) => {
        setTrace(res.data);
        const firstChild = res.data.spans.find((s) => s.parent_id) || res.data.spans[0] || null;
        setSelected(firstChild);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingState />;
  if (!trace) {
    return (
      <div className="rounded-lg border border-zinc-800 p-8 text-center text-sm text-zinc-400">
        Invalid trace — not found.
      </div>
    );
  }

  async function onEvaluate() {
    setEvaluating(true);
    try {
      const { data } = await evaluateTrace(trace!.id);
      setTrace((t) => (t ? { ...t, evaluation: data } : t));
      toast.success(`Evaluation complete · score ${formatScore(data.overall_score)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  }

  async function onReplay(model: string, promptOverride: string, temperature: number) {
    setReplaying(true);
    try {
      const { data } = await createReplay({
        original_trace_id: trace!.id,
        model,
        prompt_override: promptOverride,
        temperature,
      });
      toast.success("Replay completed");
      setReplayOpen(false);
      router.push(`/replays/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Replay failed");
    } finally {
      setReplaying(false);
    }
  }

  return (
    <div>
      <Link href="/traces" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200">
        <ArrowLeft className="h-3.5 w-3.5" />
        Traces
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-semibold text-zinc-50">Trace {trace.id}</h1>
            <button
              type="button"
              className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
              onClick={async () => {
                await navigator.clipboard.writeText(trace.id);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <StatusBadge status={trace.status} />
          </div>
          <div className="mt-1 text-sm text-zinc-400">
            {trace.agent?.name || "Customer Support Agent"}
            {trace.status === "success" ? " · Completed successfully" : ""}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-zinc-300">
            <span>{formatLatency(trace.latency_ms)}</span>
            <span>{formatTokens(trace.total_tokens)} tokens</span>
            <span>{formatCost(trace.estimated_cost)}</span>
            <span className="inline-flex items-center gap-1.5">
              Score <ScoreBadge score={trace.evaluation?.overall_score} />
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEvaluate} disabled={evaluating}>
            {evaluating ? "Evaluating…" : "Evaluate"}
          </Button>
          <Button onClick={() => setReplayOpen(true)}>Replay</Button>
        </div>
      </div>

      {trace.evaluation ? (
        <div className="mb-4 rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-3 text-sm text-zinc-400">
          <span className="text-zinc-300">Evaluation · </span>
          {trace.evaluation.reasoning}
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 xl:grid-cols-[340px_1fr]">
        <TraceTree spans={trace.spans} selectedId={selected?.id || null} onSelect={setSelected} />
        <SpanDetails span={selected} />
      </div>

      <TraceTimeline spans={trace.spans} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Input</div>
          <pre className="whitespace-pre-wrap text-sm text-zinc-300">{trace.input}</pre>
        </div>
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Output</div>
          <pre className="whitespace-pre-wrap text-sm text-zinc-300">{trace.output || "—"}</pre>
        </div>
      </div>

      <ReplayPanel
        open={replayOpen}
        onClose={() => setReplayOpen(false)}
        onRun={onReplay}
        running={replaying}
      />
    </div>
  );
}
