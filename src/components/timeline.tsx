"use client";

import * as React from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
} from "date-fns";
import { Pencil, Plane, Plus, Trash2 } from "lucide-react";
import type { Trip } from "@/lib/types";
import { ABROAD_OPTIONS } from "@/lib/abroad-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function labelForTreatment(value: Trip["abroadPrTreatment"]) {
  return ABROAD_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

interface TimelineProps {
  trips: Trip[];
  onAddTrip: () => void;
  onEdit: (trip: Trip) => void;
  onDelete: (id: string) => void;
}

type StretchKind = "canada" | "abroad";

interface JourneyStretch {
  kind: StretchKind;
  start: Date;
  end: Date;
  days: number;
}

function buildJourneyStretches(
  trips: Trip[],
  fromDate: Date,
  toDate: Date
): JourneyStretch[] {
  if (fromDate > toDate) return [];

  const sorted = [...trips].sort((a, b) =>
    a.departureDate.localeCompare(b.departureDate)
  );
  const abroadIntervals: Array<{ start: Date; end: Date }> = [];

  for (const trip of sorted) {
    const departure = parseISO(trip.departureDate);
    const returned = parseISO(trip.returnDate);
    if (!isValid(departure) || !isValid(returned) || returned < departure) {
      continue;
    }
    const abroadStart = addDays(departure, 1);
    const abroadEnd = addDays(returned, -1);
    if (abroadStart > abroadEnd) continue;

    const clippedStart = abroadStart < fromDate ? fromDate : abroadStart;
    const clippedEnd = abroadEnd > toDate ? toDate : abroadEnd;
    if (clippedStart <= clippedEnd) {
      abroadIntervals.push({ start: clippedStart, end: clippedEnd });
    }
  }

  const mergedAbroad: Array<{ start: Date; end: Date }> = [];
  for (const interval of abroadIntervals) {
    const prev = mergedAbroad[mergedAbroad.length - 1];
    if (prev && interval.start <= addDays(prev.end, 1)) {
      prev.end = interval.end > prev.end ? interval.end : prev.end;
      continue;
    }
    mergedAbroad.push({ ...interval });
  }

  const stretches: JourneyStretch[] = [];
  let cursor = fromDate;
  for (const abroad of mergedAbroad) {
    if (cursor < abroad.start) {
      const canadaEnd = addDays(abroad.start, -1);
      stretches.push({
        kind: "canada",
        start: cursor,
        end: canadaEnd,
        days: differenceInCalendarDays(canadaEnd, cursor) + 1,
      });
    }
    stretches.push({
      kind: "abroad",
      start: abroad.start,
      end: abroad.end,
      days: differenceInCalendarDays(abroad.end, abroad.start) + 1,
    });
    cursor = addDays(abroad.end, 1);
  }

  if (cursor <= toDate) {
    stretches.push({
      kind: "canada",
      start: cursor,
      end: toDate,
      days: differenceInCalendarDays(toDate, cursor) + 1,
    });
  }

  const merged: JourneyStretch[] = [];
  for (const stretch of stretches) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.kind === stretch.kind &&
      addDays(prev.end, 1).getTime() === stretch.start.getTime()
    ) {
      prev.end = stretch.end;
      prev.days = differenceInCalendarDays(prev.end, prev.start) + 1;
      continue;
    }
    merged.push({ ...stretch });
  }
  return merged;
}

export function JourneyRail({
  trips,
  fromDate,
  toDate,
}: {
  trips: Trip[];
  fromDate: Date;
  toDate: Date;
}) {
  const stretches = buildJourneyStretches(trips, fromDate, toDate);
  const totalDays = stretches.reduce((sum, stretch) => sum + stretch.days, 0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (stretches.length === 0 || totalDays <= 0) return null;

  const safeActiveIndex = Math.min(activeIndex, stretches.length - 1);
  const active = stretches[safeActiveIndex];
  let runningDays = 0;

  return (
    <div className="py-2">
      <div className="overflow-x-auto overflow-y-visible pb-2 pl-8">
        <div className="min-w-[42rem] sm:min-w-0">
          <div className="relative h-44">
            <div className="absolute left-0 right-0 top-10 h-1.5 rounded-full bg-emerald-200/90 dark:bg-emerald-900/60" />
            <div className="absolute bottom-10 left-0 right-0 h-1.5 rounded-full bg-red-200/90 dark:bg-red-950/60" />
            <span className="absolute -left-8 top-11 -translate-y-1/2 text-lg leading-none">🇨🇦</span>
            <span className="absolute -left-8 bottom-11 translate-y-1/2 text-lg leading-none">🌍</span>

            {stretches.map((stretch, index) => {
              const widthPct = (stretch.days / totalDays) * 100;
              const startPct = (runningDays / totalDays) * 100;
              runningDays += stretch.days;
              const centerPct = startPct + widthPct / 2;
              const isCanada = stretch.kind === "canada";
              const isActive = index === safeActiveIndex;

              return (
                <React.Fragment
                  key={`${stretch.kind}-${stretch.start.toISOString()}-${index}`}
                >
                  {index > 0 && (
                    <div
                      className="absolute bottom-10 top-10 w-px bg-[color:var(--color-ink)]/30 dark:bg-stone-500/60"
                      style={{ left: `${startPct}%` }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`absolute h-2 rounded-full transition ${
                      isCanada
                        ? "bg-[var(--color-forest)] dark:bg-emerald-400"
                        : "bg-[var(--color-accent)] dark:bg-red-400"
                    } ${
                      isActive
                        ? "ring-2 ring-[color:var(--color-ink)]/30"
                        : "opacity-85 hover:opacity-100"
                    }`}
                    style={{
                      left: `${startPct}%`,
                      width: `${Math.max(widthPct, 0.08)}%`,
                      minWidth: "2px",
                      top: isCanada ? "2.5rem" : undefined,
                      bottom: isCanada ? undefined : "2.5rem",
                    }}
                    aria-label={`${isCanada ? "In Canada" : "Abroad"} from ${format(stretch.start, "MMM d, yyyy")} to ${format(stretch.end, "MMM d, yyyy")}`}
                  />

                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`absolute max-w-[14rem] -translate-x-1/2 rounded-lg border bg-[var(--color-bento)] px-2 py-1 text-left text-[10px] font-semibold leading-tight transition dark:bg-stone-900 ${
                      isActive
                        ? "z-30 border-[color:var(--color-ink)] shadow-[2px_2px_0_0_var(--color-ink)]"
                        : "z-10 border-[color:var(--color-ink)]/20 hover:z-20 hover:border-[color:var(--color-ink)]/40"
                    }`}
                    style={{
                      left: `${centerPct}%`,
                      top: isCanada ? 0 : undefined,
                      bottom: isCanada ? undefined : 0,
                    }}
                  >
                    {stretch.days}d
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm font-medium text-[var(--color-muted-ink)] dark:text-stone-400">
        <span className="font-semibold text-[var(--color-ink)] dark:text-stone-200">
          {active.kind === "canada" ? "In Canada" : "Abroad"}
        </span>{" "}
        from {format(active.start, "MMM d, yyyy")} to{" "}
        {format(active.end, "MMM d, yyyy")} ({active.days} full day
        {active.days === 1 ? "" : "s"}).
      </p>
    </div>
  );
}

function TimelineHeader({ onAddTrip }: { onAddTrip: () => void }) {
  return (
    <CardHeader>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plane className="h-6 w-6 shrink-0 text-[var(--color-accent)]" />
          Your hops abroad
        </CardTitle>
        <Button
          type="button"
          variant="default"
          className="w-full shrink-0 sm:w-auto"
          onClick={onAddTrip}
        >
          <Plus className="h-4 w-4" />
          Add a trip
        </Button>
      </div>
    </CardHeader>
  );
}

export function Timeline({
  trips,
  onAddTrip,
  onEdit,
  onDelete,
}: TimelineProps) {
  const invalidTrips = trips.filter((trip) => {
    const dep = parseISO(trip.departureDate);
    const ret = parseISO(trip.returnDate);
    return !isValid(dep) || !isValid(ret) || ret < dep;
  });

  if (trips.length === 0) {
    return (
      <Card className="flex w-full min-h-[14rem] flex-col justify-center">
        <TimelineHeader onAddTrip={onAddTrip} />
        <CardContent>
          <p className="text-sm font-medium text-[var(--color-muted-ink)] dark:text-stone-400">
            Nothing here yet. Use{" "}
            <span className="font-semibold text-[var(--color-ink)] dark:text-stone-200">
              Add a trip
            </span>{" "}
            above or the floating button. Departure &amp; return days still count
            as home base (Canada).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex w-full min-h-[16rem] flex-col">
      <TimelineHeader onAddTrip={onAddTrip} />
      <CardContent className="flex flex-1 flex-col gap-3 pt-5">
        {invalidTrips.length > 0 && (
          <p className="rounded-lg border border-dashed border-amber-600/40 bg-amber-50/80 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
            {invalidTrips.length} trip
            {invalidTrips.length === 1 ? "" : "s"} have invalid dates and were
            excluded from timeline math. Edit or remove those entries below.
          </p>
        )}
        {trips.map((trip, i) => (
          <div
            key={trip.id}
            className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-[color:var(--color-ink)]/25 bg-white/60 p-4 dark:border-stone-600/50 dark:bg-stone-900/40 sm:flex-row sm:items-center sm:justify-between"
            style={{
              transform: i % 2 === 0 ? "rotate(-0.25deg)" : "rotate(0.25deg)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="font-display mt-0.5 text-lg font-bold text-[var(--color-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-display text-base font-semibold leading-tight">
                  {(() => {
                    const dep = parseISO(trip.departureDate);
                    const ret = parseISO(trip.returnDate);
                    const depLabel = isValid(dep)
                      ? format(dep, "MMM d, yyyy")
                      : trip.departureDate || "Invalid date";
                    const retLabel = isValid(ret)
                      ? format(ret, "MMM d, yyyy")
                      : trip.returnDate || "Invalid date";
                    return (
                      <>
                        {depLabel}{" "}
                        <span className="text-[var(--color-muted-ink)]">→</span>{" "}
                        {retLabel}
                      </>
                    );
                  })()}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-ink)] dark:text-stone-400">
                  {labelForTreatment(trip.abroadPrTreatment)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-10 px-0 sm:w-auto sm:px-3"
                onClick={() => onEdit(trip)}
                aria-label="Edit trip"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-10 px-0 sm:w-auto sm:px-3"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(
                      "Remove this trip? This cannot be undone."
                    )
                  ) {
                    onDelete(trip.id);
                  }
                }}
                aria-label="Remove trip"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
