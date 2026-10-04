"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Beaker,
  FlaskConical,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard, section: null },
  { href: "/traces", label: "Traces", icon: Activity, section: "OBSERVABILITY" },
  { href: "/evaluations", label: "Evaluations", icon: FlaskConical, section: "OBSERVABILITY" },
  { href: "/replays", label: "Replays", icon: Beaker, section: "EXPERIMENTATION" },
  { href: "/settings", label: "Settings", icon: Settings, section: "SYSTEM" },
];

export function Sidebar() {
  const pathname = usePathname();

  let lastSection: string | null = null;

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800/80 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-bold tracking-tight text-zinc-950">
          AL
        </div>
        <span className="text-sm font-semibold tracking-[0.12em] text-zinc-100">AGENTLENS</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const Icon = item.icon;
          return (
            <div key={item.href}>
              {showSection ? (
                <div className="mb-1 mt-4 px-2 text-[10px] font-medium tracking-[0.14em] text-zinc-500">
                  {item.section}
                </div>
              ) : null}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-zinc-800/90 text-zinc-50"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                )}
              >
                <Icon className="h-4 w-4 opacity-80" />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800/80 px-4 py-3 text-[11px] text-zinc-500">
        Customer Support Agent · v1.4
      </div>
    </aside>
  );
}
