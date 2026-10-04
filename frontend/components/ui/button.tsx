"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "outline" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-zinc-100 text-zinc-950 hover:bg-zinc-50",
        variant === "secondary" && "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        variant === "ghost" && "text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-50",
        variant === "outline" &&
          "border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800/60",
        variant === "danger" && "bg-red-600/90 text-white hover:bg-red-600",
        size === "default" && "h-9 px-3.5",
        size === "sm" && "h-8 px-2.5 text-xs",
        size === "lg" && "h-10 px-5",
        size === "icon" && "h-8 w-8",
        className,
      )}
      {...props}
    />
  );
}
