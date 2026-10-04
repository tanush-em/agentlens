"use client";

import { Button } from "@/components/ui/button";

export function ReplayPanel({
  open,
  onClose,
  onRun,
  running,
  defaultModel = "gpt-4o-mini",
}: {
  open: boolean;
  onClose: () => void;
  onRun: (model: string, promptOverride: string, temperature: number) => void;
  running: boolean;
  defaultModel?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onRun(
            String(fd.get("model") || defaultModel),
            String(fd.get("prompt") || ""),
            Number(fd.get("temperature") || 0.2),
          );
        }}
      >
        <div className="mb-4">
          <h2 className="text-base font-semibold text-zinc-50">Replay Trace</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Re-run with a different model or prompt override.
          </p>
        </div>
        <div className="mb-4 rounded-md border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Original Run</div>
          <div className="mt-1 text-zinc-300">Model · gpt-4o-mini</div>
          <div className="text-zinc-500">Prompt · Default Agent Prompt</div>
        </div>
        <label className="mb-3 block text-xs text-zinc-400">
          Model
          <select
            name="model"
            defaultValue="gpt-4.1-mini"
            className="mt-1.5 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-200"
          >
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          </select>
        </label>
        <label className="mb-3 block text-xs text-zinc-400">
          Prompt Override
          <textarea
            name="prompt"
            rows={4}
            placeholder="Optional system prompt override…"
            className="mt-1.5 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
        <label className="mb-5 block text-xs text-zinc-400">
          Temperature
          <input
            name="temperature"
            type="number"
            step="0.1"
            min="0"
            max="1"
            defaultValue="0.2"
            className="mt-1.5 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-100"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={running}>
            Cancel
          </Button>
          <Button type="submit" disabled={running}>
            {running ? "Running…" : "Run Replay"}
          </Button>
        </div>
      </form>
    </div>
  );
}
