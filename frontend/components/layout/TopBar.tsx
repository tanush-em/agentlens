"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Play, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { RunAgentModal } from "@/components/RunAgentModal";
import { runAgent } from "@/lib/api";

const titles: Record<string, string> = {
  "/": "Overview",
  "/traces": "Traces",
  "/evaluations": "Evaluations",
  "/replays": "Replays",
  "/settings": "Settings",
};

export function TopBar({ demo }: { demo?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const base = Object.keys(titles).find((k) =>
    k === "/" ? pathname === "/" : pathname.startsWith(k),
  );
  const title = titles[base || "/"] || "Overview";
  const crumb =
    pathname.startsWith("/traces/") && pathname !== "/traces"
      ? `Trace ${pathname.split("/").pop()}`
      : pathname.startsWith("/replays/") && pathname !== "/replays"
        ? `Replay ${pathname.split("/").pop()}`
        : title;

  async function handleRun(input: string, model: string) {
    setRunning(true);
    try {
      const { data } = await runAgent(input, model);
      toast.success("Agent run completed");
      setOpen(false);
      router.push(`/traces/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Run failed — is the backend running?");
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-800/80 bg-zinc-950/80 px-5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="font-medium text-zinc-400">AgentLens</span>
          <span className="text-zinc-600">/</span>
          <span className="truncate font-medium text-zinc-100">{crumb}</span>
        </div>

        <button className="ml-2 hidden items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 md:flex">
          Customer Support Agent
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          {demo ? (
            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
              Demo data
            </span>
          ) : null}
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Search traces..."
              className="h-8 w-52 rounded-md border border-zinc-800 bg-zinc-900/50 pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value;
                  router.push(v ? `/traces?q=${encodeURIComponent(v)}` : "/traces");
                }
              }}
            />
          </div>
          <ThemeToggle />
          <Button size="sm" onClick={() => setOpen(true)}>
            <Play className="h-3.5 w-3.5" />
            Run Agent
          </Button>
          <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Connected
          </div>
        </div>
      </header>
      <RunAgentModal open={open} onClose={() => setOpen(false)} onRun={handleRun} running={running} />
    </>
  );
}
