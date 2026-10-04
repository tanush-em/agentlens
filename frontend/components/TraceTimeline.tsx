"use client";

import type { Span } from "@/types";

export function TraceTimeline({ spans }: { spans: Span[] }) {
  const children = spans.filter((s) => s.parent_id);
  if (!children.length) return null;

  const root = spans.find((s) => !s.parent_id);
  const total = Math.max(root?.latency_ms || 1, ...children.map((s) => {
    const start = new Date(s.started_at).getTime();
    const rootStart = root ? new Date(root.started_at).getTime() : start;
    return start - rootStart + s.latency_ms;
  }));

  const rootStart = root ? new Date(root.started_at).getTime() : 0;
  const colors: Record<string, string> = {
    llm: "bg-sky-500/70",
    tool: "bg-amber-500/70",
    retrieval: "bg-emerald-500/70",
    agent: "bg-violet-500/70",
  };

  const ticks = [0, 0.33, 0.66, 1].map((p) => Math.round(total * p));

  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
        Timeline
      </div>
      <div className="mb-3 flex justify-between font-mono text-[10px] text-zinc-500">
        {ticks.map((t) => (
          <span key={t}>{t}ms</span>
        ))}
      </div>
      <div className="space-y-2">
        {children.map((s) => {
          const offset = Math.max(0, new Date(s.started_at).getTime() - rootStart);
          const left = (offset / total) * 100;
          const width = Math.max(2, (s.latency_ms / total) * 100);
          return (
            <div key={s.id} className="grid grid-cols-[140px_1fr] items-center gap-3">
              <div className="truncate text-xs text-zinc-400">{s.name}</div>
              <div className="relative h-5 rounded bg-zinc-950/80">
                <div
                  className={`absolute top-0.5 h-4 rounded-sm ${colors[s.type] || "bg-zinc-500"}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${s.name}: ${s.latency_ms}ms`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
