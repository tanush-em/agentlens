"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ComparisonCard } from "@/components/ComparisonCard";
import { LoadingState } from "@/components/ui/primitives";
import { getReplay } from "@/lib/api";
import type { Replay } from "@/types";

export default function ReplayDetailPage() {
  const params = useParams<{ id: string }>();
  const [replay, setReplay] = useState<Replay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReplay(params.id)
      .then((res) => setReplay(res.data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingState />;
  if (!replay) {
    return <div className="text-sm text-zinc-400">Replay not found.</div>;
  }

  return (
    <div>
      <Link href="/replays" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200">
        <ArrowLeft className="h-3.5 w-3.5" />
        Replays
      </Link>
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Original vs Replay</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Comparing{" "}
          <Link href={`/traces/${replay.original_trace_id}`} className="font-mono text-zinc-300 hover:text-zinc-50">
            {replay.original_trace_id}
          </Link>{" "}
          against replay <span className="font-mono text-zinc-300">{replay.id}</span>
        </p>
      </div>
      <ComparisonCard replay={replay} />
    </div>
  );
}
