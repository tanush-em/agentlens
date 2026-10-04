"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Span } from "@/types";
import { formatCost, formatLatency, formatTokens } from "@/lib/api";
import { Button } from "@/components/ui/button";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1200);
      }}
    >
      {ok ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function Block({ label, children, copy }: { label: string; children: React.ReactNode; copy?: string }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">{label}</div>
        {copy ? <CopyBtn text={copy} /> : null}
      </div>
      {children}
    </div>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="max-h-56 overflow-auto rounded-md border border-zinc-800 bg-zinc-950/80 p-3 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap break-words">
      {children}
    </pre>
  );
}

function tryParse(s: string) {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

export function SpanDetails({ span }: { span: Span | null }) {
  if (!span) {
    return (
      <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4 text-sm text-zinc-500">
        Select a span to inspect details.
      </div>
    );
  }

  const meta = span.metadata || {};

  if (span.type === "llm") {
    return (
      <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
        <div className="mb-4 text-sm font-semibold text-zinc-100">LLM Call</div>
        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-[11px] text-zinc-500">Model</div>
            <div className="text-zinc-200">{String(meta.model || "gpt-4o-mini")}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500">Latency</div>
            <div className="text-zinc-200">{formatLatency(span.latency_ms)}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500">Tokens</div>
            <div className="text-zinc-200">{formatTokens(span.tokens)}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500">Cost</div>
            <div className="text-zinc-200">{formatCost(span.cost)}</div>
          </div>
        </div>
        <Block label="Prompt" copy={String(meta.prompt || span.input)}>
          <Pre>{String(meta.prompt || span.input)}</Pre>
        </Block>
        <Block label="Output" copy={span.output}>
          <Pre>{span.output}</Pre>
        </Block>
        <Block label="Metadata">
          <Pre>
            {`temperature: ${meta.temperature ?? 0.2}\nmax_tokens: ${meta.max_tokens ?? 800}`}
          </Pre>
        </Block>
      </div>
    );
  }

  if (span.type === "tool") {
    const args = meta.arguments ? JSON.stringify(meta.arguments, null, 2) : tryParse(span.input);
    return (
      <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
        <div className="mb-1 text-sm font-semibold text-zinc-100">Tool Call</div>
        <div className="mb-4 font-mono text-xs text-amber-300">{String(meta.tool || span.name)}</div>
        <Block label="Arguments">
          <Pre>{args}</Pre>
        </Block>
        <Block label="Result">
          <Pre>{tryParse(span.output)}</Pre>
        </Block>
        <div className="text-sm text-zinc-400">Latency {formatLatency(span.latency_ms)}</div>
      </div>
    );
  }

  if (span.type === "retrieval") {
    const docs = (meta.documents as { title: string; score: number }[]) || [];
    return (
      <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
        <div className="mb-4 text-sm font-semibold text-zinc-100">Retrieval</div>
        <div className="mb-1 text-sm text-zinc-200">{span.name}</div>
        <Block label="Query">
          <Pre>{span.input}</Pre>
        </Block>
        <Block label="Top Documents">
          <ol className="space-y-1.5 text-sm text-zinc-300">
            {docs.map((d, i) => (
              <li key={d.title} className="flex justify-between gap-2 rounded-md border border-zinc-800 px-2.5 py-1.5">
                <span>
                  {i + 1}. {d.title}
                </span>
                <span className="font-mono text-xs text-zinc-500">{d.score.toFixed(2)}</span>
              </li>
            ))}
            {!docs.length ? <li className="text-zinc-500">No documents retrieved</li> : null}
          </ol>
        </Block>
        <div className="text-sm text-zinc-400">
          Top Score {typeof meta.top_score === "number" ? meta.top_score.toFixed(2) : "—"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
      <div className="mb-4 text-sm font-semibold text-zinc-100">{span.name}</div>
      <Block label="Input">
        <Pre>{span.input}</Pre>
      </Block>
      <Block label="Output">
        <Pre>{span.output}</Pre>
      </Block>
    </div>
  );
}
