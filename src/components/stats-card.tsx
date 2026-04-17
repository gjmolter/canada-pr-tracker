import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  className?: string;
  /** Highlight tile with a soft accent wash */
  variant?: "default" | "accent" | "forest";
}

export function StatsCard({
  title,
  value,
  description,
  className,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        variant === "accent" &&
          "bg-[var(--color-accent-soft)] dark:bg-red-950/35",
        variant === "forest" &&
          "bg-[var(--color-forest-soft)] dark:bg-emerald-950/30",
        className
      )}
    >
      <CardHeader className="pb-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-ink)] dark:text-stone-400">
          {title}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end pb-5">
        <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-[var(--color-ink)] dark:text-stone-50 sm:text-4xl">
          {value}
        </p>
        {description && (
          <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--color-muted-ink)] dark:text-stone-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
