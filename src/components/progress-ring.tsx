"use client";

import { cn } from "@/lib/cn";

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  forceGreen?: boolean;
  className?: string;
}

/** Green when the requirement is met or exceeded; red only while still short. */
const strokeForGoal = (met: boolean) =>
  met
    ? "text-[var(--color-forest)] dark:text-emerald-400"
    : "text-[var(--color-accent)] dark:text-red-400";

export function ProgressRing({
  value,
  max,
  label,
  sublabel,
  forceGreen = false,
  className,
}: ProgressRingProps) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = c * (1 - pct);
  const metGoal = forceGreen || (max > 0 && value >= max);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 text-center",
        className
      )}
    >
      <div className="relative h-[8.5rem] w-[8.5rem]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 124 124">
          <circle
            cx="62"
            cy="62"
            r={r}
            strokeWidth="11"
            className="text-stone-200 dark:text-stone-700"
            fill="none"
            stroke="currentColor"
          />
          <circle
            cx="62"
            cy="62"
            r={r}
            strokeWidth="11"
            fill="none"
            strokeLinecap="butt"
            className={cn(
              "transition-all duration-500",
              strokeForGoal(metGoal)
            )}
            stroke="currentColor"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold tabular-nums tracking-tight">
            {Math.round(pct * 100)}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted-ink)] dark:text-stone-400">
            of goal
          </span>
        </div>
      </div>
      <div className="max-w-[12rem]">
        <p className="font-display text-sm font-semibold leading-snug">{label}</p>
        {sublabel && (
          <p className="mt-1 text-xs font-medium tabular-nums text-[var(--color-muted-ink)] dark:text-stone-400">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
