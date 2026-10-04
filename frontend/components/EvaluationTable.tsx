"use client";

import Link from "next/link";
import type { Evaluation } from "@/types";
import { ScoreBadge } from "@/components/ui/badge";
import { formatScore } from "@/lib/api";

export function EvaluationTable({ items }: { items: Evaluation[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800/90">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
          <tr>
            <th className="px-3 py-2.5 font-medium">Trace</th>
            <th className="px-3 py-2.5 font-medium">Faithfulness</th>
            <th className="px-3 py-2.5 font-medium">Relevance</th>
            <th className="px-3 py-2.5 font-medium">Tool Accuracy</th>
            <th className="px-3 py-2.5 font-medium">Completion</th>
            <th className="px-3 py-2.5 font-medium">Overall</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id} className="border-b border-zinc-800/60 hover:bg-zinc-900/40">
              <td className="px-3 py-2.5">
                <Link href={`/traces/${e.trace_id}`} className="font-mono text-xs text-zinc-200 hover:text-zinc-50">
                  {e.trace_id}
                </Link>
              </td>
              <td className="px-3 py-2.5"><ScoreBadge score={e.faithfulness} /></td>
              <td className="px-3 py-2.5"><ScoreBadge score={e.relevance} /></td>
              <td className="px-3 py-2.5"><ScoreBadge score={e.tool_accuracy} /></td>
              <td className="px-3 py-2.5"><ScoreBadge score={e.task_completion} /></td>
              <td className="px-3 py-2.5 font-medium text-zinc-100">{formatScore(e.overall_score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
