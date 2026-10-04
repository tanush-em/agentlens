"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState, LoadingState, PageHeader } from "@/components/ui/primitives";
import { TraceTable } from "@/components/TraceTable";
import { getTraces } from "@/lib/api";
import type { TraceListItem } from "@/types";

export default function TracesClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [traces, setTraces] = useState<TraceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState("");
  const [latency, setLatency] = useState("");

  useEffect(() => {
    setLoading(true);
    getTraces({ q: q || undefined, status: status || undefined })
      .then((res) => {
        setTraces(res.data.items);
        setDemo(res.demo);
      })
      .finally(() => setLoading(false));
  }, [q, status]);

  const filtered = useMemo(() => {
    return traces.filter((t) => {
      if (latency === "fast" && t.latency_ms >= 2000) return false;
      if (latency === "slow" && t.latency_ms < 2000) return false;
      return true;
    });
  }, [traces, latency]);

  return (
    <div>
      <PageHeader
        title="Trace Explorer"
        subtitle="Inspect individual agent executions and understand exactly what happened."
      />
      {demo ? <div className="mb-3 text-xs text-amber-300/90">Demo data</div> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search input or trace id…"
          className="h-9 min-w-[220px] flex-1 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-300"
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="running">Running</option>
        </select>
        <select
          className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-300"
          defaultValue=""
        >
          <option value="">All agents</option>
          <option value="ag_csupport">Customer Support Agent</option>
        </select>
        <select
          className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-300"
          defaultValue=""
        >
          <option value="">Any date</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
        </select>
        <select
          value={latency}
          onChange={(e) => setLatency(e.target.value)}
          className="h-9 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-300"
        >
          <option value="">Any latency</option>
          <option value="fast">&lt; 2s</option>
          <option value="slow">≥ 2s</option>
        </select>
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="No traces" description="No executions match your filters." />
      ) : (
        <TraceTable traces={filtered} />
      )}
    </div>
  );
}
