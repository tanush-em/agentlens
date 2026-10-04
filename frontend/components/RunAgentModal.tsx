"use client";

import { Button } from "@/components/ui/button";

export function RunAgentModal({
  open,
  onClose,
  onRun,
  running,
}: {
  open: boolean;
  onClose: () => void;
  onRun: (input: string, model: string) => void;
  running: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onRun(String(fd.get("input") || ""), String(fd.get("model") || "gpt-4o-mini"));
        }}
      >
        <div className="mb-4">
          <h2 className="text-base font-semibold text-zinc-50">Run Agent</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Execute the Customer Support Agent and create a new trace.
          </p>
        </div>
        <label className="mb-3 block text-xs text-zinc-400">
          Agent
          <input
            disabled
            value="Customer Support Agent"
            className="mt-1.5 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-300"
          />
        </label>
        <label className="mb-3 block text-xs text-zinc-400">
          User Message
          <textarea
            name="input"
            required
            rows={4}
            placeholder="e.g. Why was my invoice higher this month?"
            className="mt-1.5 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
        </label>
        <label className="mb-5 block text-xs text-zinc-400">
          Model
          <select
            name="model"
            defaultValue="gpt-4o-mini"
            className="mt-1.5 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none"
          >
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={running}>
            Cancel
          </Button>
          <Button type="submit" disabled={running}>
            {running ? "Running…" : "Run"}
          </Button>
        </div>
      </form>
    </div>
  );
}
