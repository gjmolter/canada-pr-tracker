"use client";

import { AlertTriangle, Sparkles, XCircle } from "lucide-react";
import type { IntegrityMessage } from "@/lib/integrity";
import { cn } from "@/lib/cn";

export function DataIntegrityBanner({ messages }: { messages: IntegrityMessage[] }) {
  if (messages.length === 0) return null;
  const hasError = messages.some((m) => m.severity === "error");

  return (
    <div
      className={cn(
        "bento col-span-12 p-5 sm:p-6",
        hasError
          ? "bg-[#fff5f5] dark:bg-red-950/40"
          : "bg-amber-50 dark:bg-amber-950/35"
      )}
      role="status"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[color:var(--color-ink)] text-[color:var(--color-ink)] dark:border-stone-200",
            hasError ? "bg-[var(--color-accent-soft)]" : "bg-amber-100 dark:bg-amber-900/50"
          )}
        >
          {hasError ? (
            <XCircle className="h-5 w-5 text-[var(--color-accent)]" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-display text-lg font-semibold">
            {hasError ? "Hold up! fix these first" : "Heads up"}
          </p>
          <ul className="space-y-1.5 text-sm font-medium leading-snug text-[var(--color-muted-ink)] dark:text-stone-300">
            {messages.map((m) => (
              <li key={m.id} className="flex gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                <span>{m.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
