"use client";

import { useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { MapPin, Plus } from "lucide-react";
import { useTracker } from "@/context/tracker-context";
import { runIntegrityChecks } from "@/lib/integrity";
import { parseDate, toISODate } from "@/lib/dateUtils";
import {
  CIT_REQUIRED,
  PR_REQUIRED,
  calculateCitizenshipEligibility,
  calculateMaxStayOut,
  calculatePRStatus,
} from "@/lib/residency";
import type { Trip } from "@/lib/types";
import { BackupControls } from "@/components/backup-controls";
import { DataIntegrityBanner } from "@/components/data-integrity-banner";
import { HowItWorksModal } from "@/components/how-it-works-modal";
import { ProfileReferenceCard } from "@/components/profile-reference-card";
import { ProgressRing } from "@/components/progress-ring";
import { StatsCard } from "@/components/stats-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { JourneyRail, Timeline } from "@/components/timeline";
import { TravelModal } from "@/components/travel-modal";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function statusBadge(status: string | undefined) {
  if (status === "safe")
    return "border-[color:var(--color-forest)] bg-[var(--color-forest-soft)] text-[var(--color-forest)] dark:bg-emerald-950/40 dark:text-emerald-200";
  if (status === "at_risk")
    return "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] dark:bg-red-950/50 dark:text-red-200";
  if (status === "insufficient_history")
    return "border-amber-600/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
  return "border-stone-400/40 bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300";
}

function statusLabel(status: string | undefined) {
  if (status === "safe") return "Looking solid";
  if (status === "at_risk") return "Needs attention";
  if (status === "insufficient_history") return "Need more history";
  return "Set your dates";
}

export function HomeApp() {
  const { hydrated, state, addTrip, updateTrip, deleteTrip } = useTracker();
  const [asOfIso, setAsOfIso] = useState(() => toISODate(startOfDay(new Date())));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const asOf = useMemo(
    () => parseDate(asOfIso) ?? startOfDay(new Date()),
    [asOfIso]
  );

  const integrity = useMemo(
    () => runIntegrityChecks(state.profile, state.trips),
    [state.profile, state.trips]
  );

  const pr = useMemo(
    () => calculatePRStatus(state.trips, state.profile, asOf),
    [asOf, state.profile, state.trips]
  );

  const cit = useMemo(
    () => calculateCitizenshipEligibility(state.trips, state.profile, asOf),
    [asOf, state.profile, state.trips]
  );

  const arrivalReadyForCalcs = Boolean(parseDate(state.profile.arrivalDate));
  const arrivalEnteredLive = Boolean(parseDate(state.profile.arrivalDate));
  const firstArrival = useMemo(
    () => parseDate(state.profile.arrivalDate),
    [state.profile.arrivalDate]
  );

  const burn = useMemo(() => {
    if (!pr) return null;
    return calculateMaxStayOut(state.trips, state.profile, asOf);
  }, [pr, asOf, state.profile, state.trips]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="bento flex h-16 w-16 items-center justify-center rounded-2xl border-[color:var(--color-ink)] text-[var(--color-accent)]">
          <MapPin className="h-8 w-8 animate-pulse" />
        </div>
        <p className="font-display text-lg font-semibold text-[var(--color-ink)] dark:text-stone-100">
          Unpacking your data…
        </p>
        <p className="max-w-xs text-sm font-medium text-[var(--color-muted-ink)] dark:text-stone-400">
          Pulling stuff from your browser&apos;s storage
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-[color:var(--color-ink)]/[0.08] bg-transparent px-3 py-3 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[min(100%,88rem)] items-center justify-between gap-4">
          <span
            className="font-display inline-flex items-center gap-2 text-base leading-[1.05] font-bold tracking-tight text-[var(--color-ink)] dark:text-stone-50 sm:text-xl"
            aria-label="Canada Permanent Residency Tracker"
          >
            <span aria-hidden>🇨🇦</span>
            Permanent Residency Tracker
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-[min(100%,88rem)] px-3 py-8 pb-36 sm:px-6 lg:px-10 lg:py-10">
        <div className="grid grid-cols-12 gap-6 sm:gap-7 lg:gap-10">
          {/* Hero */}
          <div className="bento bento--tilt relative col-span-12 overflow-hidden p-6 sm:p-8 lg:col-span-7">
            <div className="pointer-events-none absolute -right-8 -top-10 text-[10rem] leading-none opacity-[0.07] dark:opacity-[0.12]">
              🍁
            </div>
            <div className="relative max-w-xl space-y-4">
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-ink)] dark:text-stone-50 sm:text-5xl lg:text-[3.25rem]">
                Count the days you actually stood on Canadian soil.
              </h1>
              <p className="text-base font-medium leading-relaxed text-[var(--color-muted-ink)] dark:text-stone-400">
                <button
                  type="button"
                  onClick={() => setHowItWorksOpen(true)}
                  className="font-semibold text-[var(--color-accent)] underline decoration-2 underline-offset-4 transition-colors hover:text-[var(--color-accent-hover)] dark:text-red-300 dark:hover:text-red-200"
                >
                  How it works
                </button>
                <span className="text-[var(--color-muted-ink)] dark:text-stone-500">
                  {" "}
                  — the rules this little workbook is using.
                </span>
              </p>
              <p className="max-w-xl text-sm font-medium leading-relaxed text-[var(--color-muted-ink)] dark:text-stone-500">
                <span className="font-display font-semibold text-[var(--color-ink)] dark:text-stone-300">
                  What we do.
                </span>{" "}
                We track trips (with departure and return days counted in
                Canada), scan rolling 1825-day windows for PR maintenance (730
                days), and estimate physical-presence credit toward
                citizenship&apos;s 1,095-day bar, including the half-day rule
                for pre-PR time on Canadian soil. Everything stays in your
                browser.
              </p>
              <p className="max-w-xl text-sm font-medium leading-relaxed text-[var(--color-muted-ink)] dark:text-stone-500">
                <span className="font-display font-semibold text-[var(--color-ink)] dark:text-stone-300">
                  What we don&apos;t do.
                </span>{" "}
                This is a private planning sketch, not IRCC. We don&apos;t handle
                every edge case (humanitarian pause, status changes mid-day,
                etc.). Use official sources or a licensed representative for
                decisions that matter.
              </p>
            </div>
          </div>

          {/* Who's counting + reference date */}
          <div className="col-span-12 lg:col-span-5">
            <ProfileReferenceCard
              asOfIso={asOfIso}
              onAsOfIsoChange={setAsOfIso}
            />
          </div>

          <div className="col-span-12">
            <Timeline
              trips={state.trips}
              onAddTrip={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              onEdit={(trip) => {
                setEditing(trip);
                setModalOpen(true);
              }}
              onDelete={deleteTrip}
            />
          </div>

          {firstArrival && (
            <div className="col-span-12">
              <div className="relative left-1/2 w-[min(96vw,110rem)] -translate-x-1/2 px-1 sm:px-2">
                <JourneyRail trips={state.trips} fromDate={firstArrival} toDate={asOf} />
              </div>
            </div>
          )}

          {integrity.length > 0 && (
            <div className="col-span-12">
              <DataIntegrityBanner messages={integrity} />
            </div>
          )}

          {!arrivalEnteredLive && (
            <div className="bento col-span-12 border-amber-700/30 bg-amber-50 p-5 text-sm font-semibold text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-50">
              Add your first arrival date in{" "}
              <span className="font-display text-[var(--color-accent)] dark:text-red-300">
                Getting started
              </span>{", "}
              then the scoreboard can run.
            </div>
          )}

          {/* Dashboard strip */}
          <Card className="col-span-12 flex flex-col overflow-hidden lg:flex-row">
            <div className="flex flex-1 flex-col border-b-2 border-[color:var(--color-ink)] bg-[var(--color-accent)] px-5 py-4 text-white lg:w-[38%] lg:border-b-0 lg:border-r-2">
              <p className="font-display text-2xl mb-2 font-bold">The scoreboard</p>
              <p className="mt-2 text-sm font-medium leading-snug text-white/90">
                From your reference date, we roll five-year windows and calculate how you currently stand. 
                <br/><br/>
                The left ring is PR maintenance: every 1825-day span must
                still show at least 730 qualifying days present. The right ring is
                citizenship physical presence toward the 1,095 needed for citizenship application, counting half credit
                for eligible pre-PR days in Canada (capped at 365). 
              </p>
            </div>
            <CardHeader className="flex-1 border-b-2 border-dashed border-[color:var(--color-ink)]/10 lg:border-b-0 lg:border-r-2 dark:border-stone-600/30">
              <CardTitle className="sr-only">Progress</CardTitle>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <ProgressRing
                  value={
                    pr ? Math.min(pr.minWindowSum, PR_REQUIRED) : 0
                  }
                  max={PR_REQUIRED}
                  label="PR window (730)"
                  sublabel={
                    pr
                      ? `${pr.minWindowSum} / ${PR_REQUIRED} weakest`
                      : "Need profile"
                  }
                />
                <ProgressRing
                  value={
                    cit
                      ? Math.min(cit.totalEligibleDays, CIT_REQUIRED)
                      : 0
                  }
                  max={CIT_REQUIRED}
                  label="Citizenship (1095)"
                  sublabel={
                    cit
                      ? `${cit.totalEligibleDays.toFixed(1)} / ${CIT_REQUIRED} rolling`
                      : "Need profile"
                  }
                  forceGreen
                />
              </div>
            </CardHeader>
            <div className="flex w-full flex-col justify-center gap-3 p-5 sm:p-6 lg:max-w-[14rem] lg:border-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-ink)] dark:text-stone-500">
                PR maintenance
              </p>
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                  statusBadge(pr?.status)
                )}
              >
                {statusLabel(pr?.status)}
              </span>
              <p className="text-xs font-medium leading-snug text-[var(--color-muted-ink)] dark:text-stone-400">
                {!arrivalReadyForCalcs && "Add arrival to see status."}
                {arrivalReadyForCalcs && !pr && "—"}
                {pr?.status === "safe" &&
                  "Every 1825-day window still shows at least 730 qualifying days present."}
                {pr?.status === "at_risk" &&
                  "At least one window is under 730 — plan more time in Canada."}
                {pr?.status === "insufficient_history" &&
                  "Not enough calendar coverage yet for a full five-year assessment."}
              </p>
            </div>
          </Card>

          <div className="col-span-12 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:gap-6">
            <StatsCard
              variant="accent"
              title="days needed for citizenship"
              value={
                cit
                  ? Math.max(0, Math.ceil(cit.daysRemaining)).toString()
                  : "—"
              }
              description={
                cit?.estimatedEligibleDate
                  ? `If you stay in Canada continuously from your reference date, you will reach 1,095 days on ${format(cit.estimatedEligibleDate, "MMM d, yyyy")}.`
                  : undefined
              }
              className="col-span-2 sm:col-span-1"
            />
            <StatsCard
              title="Days in Canada above minimum"
              value={
                pr && pr.status !== "insufficient_history"
                  ? `${pr.marginDays}`
                  : "—"
              }
              description={
                pr?.status === "insufficient_history"
                  ? "Available once you have a full 1825-day history."
                  : "Extra qualifying PR days above 730 in your weakest 1825-day window."
              }
              className="col-span-2 sm:col-span-1"
            />
            <StatsCard
              variant="forest"
              title="Longest possible trip abroad"
              value={
                pr ? `${pr.maxFutureOutsideSpanIfDepartOnAsOf}` : "—"
              }
              description="Maximum full days you can stay abroad if you leave on the reference date."
              className="col-span-2 sm:col-span-1"
            />
            <StatsCard
              title="Latest safe return date"
              value={
                burn?.latestFeasibleReturn
                  ? format(burn.latestFeasibleReturn, "MMM d, yyyy")
                  : "—"
              }
              description="Latest date you can return from a trip that started on reference date and still keep PR."
              className="col-span-2 sm:col-span-1"
            />
          </div>

          <div className="col-span-12 w-full">
            <BackupControls />
          </div>

          <p className="col-span-12 text-center text-xs font-medium leading-relaxed text-[var(--color-muted-ink)] dark:text-stone-500">
            Not legal advice. IRCC has the final word. Obviously.
          </p>
        </div>

        <TravelModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          initial={editing}
          onSave={(payload) => {
            if (editing) updateTrip(editing.id, payload);
            else addTrip(payload);
          }}
        />

        <HowItWorksModal
          open={howItWorksOpen}
          onClose={() => setHowItWorksOpen(false)}
        />

        <Button
          type="button"
          className="fixed bottom-5 right-5 z-40 h-14 gap-2 rounded-2xl border-2 border-[color:var(--color-ink)] px-6 text-base font-bold shadow-[6px_6px_0_0_var(--color-ink)] hover:translate-y-[3px] hover:shadow-[3px_3px_0_0_var(--color-ink)] active:translate-y-[4px] active:shadow-[2px_2px_0_0_var(--color-ink)] sm:bottom-8 sm:right-8 dark:border-stone-100 dark:shadow-[6px_6px_0_0_rgb(244_240_234/0.5)] dark:hover:shadow-[3px_3px_0_0_rgb(244_240_234/0.5)] dark:active:shadow-[2px_2px_0_0_rgb(244_240_234/0.5)]"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
          Log a trip
        </Button>
      </div>
    </>
  );
}
