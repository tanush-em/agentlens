"use client";

import { useEffect, useState } from "react";
import { KpiCard, LoadingState, PageHeader } from "@/components/ui/primitives";
import { MetricChart } from "@/components/MetricChart";
import { TraceTable } from "@/components/TraceTable";
import { getTraces } from "@/lib/api";
import { chartData } from "@/lib/demo-data";
import type { TraceListItem } from "@/types";

export default function DashboardPage() {
  const [traces, setTraces] = useState<TraceListItem[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTraces()
      .then((res) => {
        setTraces(res.data.items.slice(0, 8));
        setDemo(res.demo);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Agent Overview"
        subtitle="Monitor agent performance, quality, and execution behavior."
      />
      {demo ? (
        <div className="mb-4 text-xs text-amber-300/90">Showing demo data — backend unavailable.</div>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Runs" value="2,481" trend="+12.4%" />
        <KpiCard label="Success Rate" value="96.8%" trend="+0.6%" />
        <KpiCard label="Avg Latency" value="1.84s" trend="-80ms" trendUp />
        <KpiCard label="Avg Cost" value="$0.0084" trend="-3.1%" />
        <KpiCard label="Faithfulness" value="94.2%" trend="+1.2%" />
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-2">
        <MetricChart title="Runs over time" data={chartData.runs} kind="line" color="#38bdf8" />
        <MetricChart title="Average latency" data={chartData.latency} kind="area" color="#a78bfa" valueSuffix="s" />
        <MetricChart title="Evaluation score" data={chartData.quality} kind="line" color="#34d399" />
        <MetricChart title="Cost per run" data={chartData.cost} kind="bar" color="#fbbf24" valuePrefix="$" />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-200">Recent Traces</h2>
      </div>
      <TraceTable traces={traces} dense />
    </div>
  );
}
