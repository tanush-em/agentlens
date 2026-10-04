"use client";

import { Suspense } from "react";
import TracesPage from "./TracesClient";
import { LoadingState } from "@/components/ui/primitives";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TracesPage />
    </Suspense>
  );
}
