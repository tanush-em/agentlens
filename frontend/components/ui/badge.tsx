"use client";

import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "success" | "error" | "warning" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "neutral" && "bg-zinc-800 text-zinc-300",
        tone === "success" && "bg-emerald-500/15 text-emerald-400",
        tone === "error" && "bg-red-500/15 text-red-400",
        tone === "warning" && "bg-amber-500/15 text-amber-400",
        tone === "info" && "bg-sky-500/15 text-sky-400",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "success" ? "success" : status === "error" ? "error" : status === "running" ? "info" : "neutral";
  const label = status === "success" ? "Success" : status === "error" ? "Error" : status;
  return <Badge tone={tone}>{label}</Badge>;
}

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-zinc-500">—</span>;
  const v = score <= 1 ? Math.round(score * 100) : Math.round(score);
  const tone = v >= 90 ? "success" : v >= 75 ? "warning" : "error";
  return <Badge tone={tone}>{v}</Badge>;
}
