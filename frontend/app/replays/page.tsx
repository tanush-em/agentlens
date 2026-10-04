"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, LoadingState, PageHeader } from "@/components/ui/primitives";
import { ScoreBadge } from "@/components/ui/badge";
import { formatCost, formatLatency, formatTokens, getReplays } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import type { Replay } from "@/types";

export default function ReplaysPage() {
  const [items, setItems] = useState<Replay[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    getReplays()
      .then((res) => {
        setItems(res.data.items);
        setDemo(res.demo);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Replay Lab"
        subtitle="Re-run agent executions with different models or prompts."
      />
      {demo ? <div className="mb-3 text-xs text-amber-300/90">Demo data</div> : null}

      {items.length === 0 ? (
        <EmptyState
          title="No replays yet"
          description="Open a trace and click Replay to start an experiment."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800/90">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">Replay</th>
                <th className="px-3 py-2.5 font-medium">Original Trace</th>
                <th className="px-3 py-2.5 font-medium">Model</th>
                <th className="px-3 py-2.5 font-medium">Latency</th>
                <th className="px-3 py-2.5 font-medium">Tokens</th>
                <th className="px-3 py-2.5 font-medium">Cost</th>
                <th className="px-3 py-2.5 font-medium">Score</th>
                <th className="px-3 py-2.5 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/40">
                  <td className="px-3 py-2.5">
                    <Link href={`/replays/${r.id}`} className="font-mono text-xs text-zinc-200 hover:text-zinc-50">
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/traces/${r.original_trace_id}`} className="font-mono text-xs text-zinc-400 hover:text-zinc-50">
                      {r.original_trace_id}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-300">{r.model}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{formatLatency(r.latency_ms)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{formatTokens(r.tokens)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{formatCost(r.cost)}</td>
                  <td className="px-3 py-2.5"><ScoreBadge score={r.evaluation_score} /></td>
                  <td className="px-3 py-2.5 text-xs text-zinc-500">{timeAgo(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
