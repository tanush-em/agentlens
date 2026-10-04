"use client";

import { Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/ui/primitives";
import { useTheme, type Theme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Workspace preferences." />
      <div className="max-w-xl space-y-4 rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-5 text-sm text-zinc-400">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div>
            <div className="text-zinc-200">Appearance</div>
            <div className="mt-0.5 text-xs text-zinc-500">Switch between light and dark mode.</div>
          </div>
          <div className="flex rounded-md border border-zinc-800 p-0.5">
            {themes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors",
                  theme === id
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-200",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span>Default model</span>
          <span className="text-zinc-200">gpt-4o-mini</span>
        </div>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span>API endpoint</span>
          <span className="font-mono text-xs text-zinc-200">
            {process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Retention</span>
          <span className="text-zinc-200">30 days</span>
        </div>
      </div>
    </div>
  );
}
