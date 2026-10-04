"use client";

import { useEffect, useState } from "react";
import { EvaluationTable } from "@/components/EvaluationTable";
import { EmptyState, KpiCard, LoadingState, PageHeader } from "@/components/ui/primitives";
import { getEvaluations } from "@/lib/api";
import type { Evaluation } from "@/types";

export default function EvaluationsPage() {
  const [items, setItems] = useState<Evaluation[]>([]);
  const [averages, setAverages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    getEvaluations()
      .then((res) => {
        setItems(res.data.items);
        setAverages(res.data.averages);
        setDemo(res.demo);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Evaluation Center"
        subtitle="Measure the quality and reliability of your agent runs."
      />
      {demo ? <div className="mb-3 text-xs text-amber-300/90">Demo data</div> : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Overall Quality" value={String(averages.overall_score ?? "—")} />
        <KpiCard label="Faithfulness" value={String(averages.faithfulness ?? "—")} />
        <KpiCard label="Relevance" value={String(averages.relevance ?? "—")} />
        <KpiCard label="Tool Accuracy" value={String(averages.tool_accuracy ?? "—")} />
        <KpiCard label="Task Completion" value={String(averages.task_completion ?? "—")} />
      </div>

      {items.length === 0 ? (
        <EmptyState title="No evaluations" description="Evaluate a trace from the Trace Detail page." />
      ) : (
        <EvaluationTable items={items} />
      )}
    </div>
  );
}
