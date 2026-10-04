"use client";

import Link from "next/link";
import type { TraceListItem } from "@/types";
import { ScoreBadge, StatusBadge } from "@/components/ui/badge";
import { formatCost, formatLatency, formatTokens } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

export function TraceTable({
  traces,
  dense,
}: {
  traces: TraceListItem[];
  dense?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800/90">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
          <tr>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Trace</th>
            {!dense ? <th className="px-3 py-2.5 font-medium">Agent</th> : null}
            <th className="px-3 py-2.5 font-medium">Input</th>
            <th className="px-3 py-2.5 font-medium">Latency</th>
            <th className="px-3 py-2.5 font-medium">Tokens</th>
            <th className="px-3 py-2.5 font-medium">Cost</th>
            <th className="px-3 py-2.5 font-medium">Score</th>
            <th className="px-3 py-2.5 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {traces.map((t) => (
            <tr
              key={t.id}
              className="border-b border-zinc-800/60 transition-colors hover:bg-zinc-900/40"
            >
              <td className="px-3 py-2.5">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-3 py-2.5">
                <Link href={`/traces/${t.id}`} className="font-mono text-xs text-zinc-200 hover:text-zinc-50">
                  {t.id}
                </Link>
              </td>
              {!dense ? (
                <td className="px-3 py-2.5 text-zinc-400">{t.agent_name || "—"}</td>
              ) : null}
              <td className="max-w-[280px] truncate px-3 py-2.5 text-zinc-300">
                <Link href={`/traces/${t.id}`} className="hover:text-zinc-50">
                  {t.input}
                </Link>
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-zinc-300">{formatLatency(t.latency_ms)}</td>
              <td className="px-3 py-2.5 font-mono text-xs text-zinc-300">{formatTokens(t.total_tokens)}</td>
              <td className="px-3 py-2.5 font-mono text-xs text-zinc-300">{formatCost(t.estimated_cost)}</td>
              <td className="px-3 py-2.5">
                <ScoreBadge score={t.evaluation_score} />
              </td>
              <td className="px-3 py-2.5 text-xs text-zinc-500">{timeAgo(t.started_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
