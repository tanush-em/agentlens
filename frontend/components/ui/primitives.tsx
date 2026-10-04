"use client";

import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  trend,
  trendUp = true,
}: {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/40 px-4 py-3.5">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight text-zinc-50">{value}</div>
        {trend ? (
          <span className={cn("text-xs", trendUp ? "text-emerald-400" : "text-red-400")}>{trend}</span>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center">
      <div className="text-sm font-medium text-zinc-200">{title}</div>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3 p-1">
      <div className="h-4 w-40 animate-pulse rounded bg-zinc-800/80" />
      <div className="h-24 animate-pulse rounded-lg bg-zinc-900/60" />
      <div className="h-40 animate-pulse rounded-lg bg-zinc-900/60" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}
