"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** Compact toggle — not a `.bento` card so it doesn’t pick up card hover wobble. */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="inline-flex h-11 w-[5.25rem] animate-pulse rounded-xl border border-[color:var(--color-ink)]/20 bg-white/50 dark:border-stone-600/40 dark:bg-stone-900/50"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="inline-flex h-11 items-center gap-0.5 rounded-xl border-2 border-[color:var(--color-ink)] bg-[var(--color-bento)] p-[2px] shadow-[4px_4px_0_0_rgb(24_24_27/0.14)] dark:border-stone-200 dark:bg-stone-900 dark:shadow-[4px_4px_0_0_rgb(244_240_234/0.12)]"
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]/80 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bento)] dark:focus-visible:ring-stone-200 dark:focus-visible:ring-offset-stone-900",
          !isDark
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            : "text-[var(--color-muted-ink)] hover:bg-black/5 dark:text-stone-400 dark:hover:bg-white/10"
        )}
        aria-pressed={!isDark}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]/80 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bento)] dark:focus-visible:ring-stone-200 dark:focus-visible:ring-offset-stone-900",
          isDark
            ? "bg-stone-800 text-amber-200"
            : "text-[var(--color-muted-ink)] hover:bg-black/5 dark:text-stone-400 dark:hover:bg-white/10"
        )}
        aria-pressed={isDark}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
