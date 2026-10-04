"use client";

import type { Span } from "@/types";
import { cn } from "@/lib/utils";
import { formatLatency } from "@/lib/api";

const typeColor: Record<string, string> = {
  agent: "text-violet-300",
  llm: "text-sky-300",
  tool: "text-amber-300",
  retrieval: "text-emerald-300",
};

export function TraceTree({
  spans,
  selectedId,
  onSelect,
}: {
  spans: Span[];
  selectedId: string | null;
  onSelect: (span: Span) => void;
}) {
  const root = spans.find((s) => !s.parent_id) || spans[0];
  const children = spans.filter((s) => s.parent_id === root?.id);

  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-3">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
        Execution Tree
      </div>
      {root ? (
        <button
          type="button"
          onClick={() => onSelect(root)}
          className={cn(
            "mb-1 w-full rounded-md px-2 py-1.5 text-left transition-colors",
            selectedId === root.id ? "bg-zinc-800" : "hover:bg-zinc-800/50",
          )}
        >
          <div className="text-sm font-medium text-zinc-100">{root.name}</div>
          <div className="text-[11px] uppercase tracking-wide text-violet-300">agent · {formatLatency(root.latency_ms)}</div>
        </button>
      ) : null}
      <div className="ml-3 border-l border-zinc-800 pl-3">
        {children.map((span, i) => (
          <button
            key={span.id}
            type="button"
            onClick={() => onSelect(span)}
            className={cn(
              "mb-1 w-full rounded-md px-2 py-1.5 text-left transition-colors",
              selectedId === span.id ? "bg-zinc-800" : "hover:bg-zinc-800/50",
              i === children.length - 1 && "mb-0",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-zinc-200">{span.name}</div>
              <div className="font-mono text-[11px] text-zinc-500">{formatLatency(span.latency_ms)}</div>
            </div>
            <div className={cn("text-[11px] uppercase tracking-wide", typeColor[span.type] || "text-zinc-400")}>
              {span.type}
              {span.status === "error" ? " · failed" : ""}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
