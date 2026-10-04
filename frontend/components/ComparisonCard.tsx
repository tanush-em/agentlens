"use client";

import type { Replay } from "@/types";
import { formatCost, formatLatency, formatScore, formatTokens } from "@/lib/api";

export function ComparisonCard({ replay }: { replay: Replay }) {
  const origScore = replay.original_score ?? 0.9;
  const newScore = replay.evaluation_score;
  const o = origScore <= 1 ? origScore * 100 : origScore;
  const n = newScore <= 1 ? newScore * 100 : newScore;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Original
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Model</dt><dd>gpt-4o-mini</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Latency</dt><dd>{formatLatency(replay.original_latency_ms || 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Tokens</dt><dd>{formatTokens(replay.original_tokens || 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Cost</dt><dd>{formatCost(replay.original_cost || 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Score</dt><dd>{formatScore(replay.original_score)}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-400/80">
            Replay
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Model</dt><dd>{replay.model}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Latency</dt><dd>{formatLatency(replay.latency_ms)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Tokens</dt><dd>{formatTokens(replay.tokens)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Cost</dt><dd>{formatCost(replay.cost)}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Score</dt><dd>{formatScore(replay.evaluation_score)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Quality</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 flex-1 overflow-hidden rounded bg-zinc-800">
              <div className="h-full bg-zinc-400" style={{ width: `${o}%` }} />
            </div>
            <span className="w-8 text-right font-mono text-xs">{Math.round(o)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="h-2 flex-1 overflow-hidden rounded bg-zinc-800">
              <div className="h-full bg-emerald-400" style={{ width: `${n}%` }} />
            </div>
            <span className="w-8 text-right font-mono text-xs">{Math.round(n)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
          Response Difference
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-zinc-500">Original</div>
            <pre className="whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300">
              {replay.original_output || "—"}
            </pre>
          </div>
          <div>
            <div className="mb-1 text-xs text-zinc-500">Replay</div>
            <pre className="whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300">
              {replay.output}
            </pre>
          </div>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-zinc-400">
          <li className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Key Changes</li>
          <li>· More concise response</li>
          <li>· Better billing explanation</li>
          <li>· Lower token usage</li>
        </ul>
      </div>
    </div>
  );
}
