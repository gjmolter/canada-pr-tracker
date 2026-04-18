"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTracker } from "@/context/tracker-context";

interface ProfileReferenceCardProps {
  asOfIso: string;
  onAsOfIsoChange: (iso: string) => void;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-muted-ink)] dark:text-stone-400">
      {children}
    </p>
  );
}

export function ProfileReferenceCard({
  asOfIso,
  onAsOfIsoChange,
}: ProfileReferenceCardProps) {
  const { state, setProfile } = useTracker();
  const { profile } = state;

  const [refDate, setRefDate] = useState(asOfIso);
  const [arrival, setArrival] = useState(profile.arrivalDate);
  const [prDate, setPrDate] = useState(profile.prDate ?? "");

  useEffect(() => {
    setRefDate(asOfIso);
  }, [asOfIso]);

  useEffect(() => {
    setArrival(profile.arrivalDate);
    setPrDate(profile.prDate ?? "");
  }, [profile.arrivalDate, profile.prDate]);

  const commitReference = () => {
    if (refDate !== asOfIso) onAsOfIsoChange(refDate);
  };

  const commitProfile = () => {
    const nextPr = prDate ? prDate : null;
    if (
      arrival !== profile.arrivalDate ||
      nextPr !== profile.prDate
    ) {
      setProfile({ arrivalDate: arrival, prDate: nextPr });
    }
  };

  return (
    <Card className="bento--tilt flex h-full flex-col overflow-hidden">
      <div className="border-b-2 border-[color:var(--color-ink)] bg-[var(--color-accent)] px-5 py-4 text-white sm:px-6">
        <div className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <UserRound className="h-6 w-6 shrink-0 opacity-95" aria-hidden />
          Getting started
        </div>
        <p className="mt-1.5 text-sm font-medium leading-snug text-white/90">
          Your milestone dates. (values apply when you click outside)
        </p>
      </div>

      <CardContent className="flex flex-1 flex-col gap-6 p-5 sm:p-6">
        <div className="space-y-2">
          <FieldLabel>Reference date (as of)</FieldLabel>
          <input
            type="date"
            className="input-bento w-full"
            value={refDate}
            onChange={(e) => setRefDate(e.target.value)}
            onBlur={commitReference}
          />
          <p className="text-xs font-medium leading-snug text-[var(--color-muted-ink)] dark:text-stone-500">
            We treat this day as &ldquo;today&rdquo; for PR and
            citizenship math, handy for future trips.
          </p>
        </div>

        <div className="space-y-2">
          <FieldLabel>First arrival in Canada</FieldLabel>
          <input
            type="date"
            className="input-bento w-full"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            onBlur={commitProfile}
            required
          />
          <p className="text-xs font-medium leading-snug text-[var(--color-muted-ink)] dark:text-stone-500">
            When you first touched Canadian soil.
          </p>
        </div>

        <div className="space-y-2">
          <FieldLabel>PR granted</FieldLabel>
          <input
            type="date"
            className="input-bento w-full"
            value={prDate}
            onChange={(e) => setPrDate(e.target.value)}
            onBlur={commitProfile}
            required
          />
          <p className="text-xs font-medium leading-snug text-[var(--color-muted-ink)] dark:text-stone-500">
            The day you got your PR card.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
