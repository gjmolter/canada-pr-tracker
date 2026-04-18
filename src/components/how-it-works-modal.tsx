"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ open, onClose }: HowItWorksModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));

    const focusables = getFocusable();
    (focusables[0] ?? dialog).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = getFocusable();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center bg-ink/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        tabIndex={-1}
        className="max-h-[min(92vh,46rem)] w-full max-w-2xl overflow-hidden rounded-[1.25rem] border-2 border-(--color-ink) bg-(--color-bento) shadow-[8px_8px_0_0_var(--color-ink)] dark:border-stone-200 dark:bg-[#1c1917] dark:shadow-[8px_8px_0_0_rgb(244_240_234/0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-(--color-ink) bg-(--color-accent) px-4 py-3 text-white sm:px-5">
          <h2 id="how-it-works-title" className="font-display text-lg font-bold">
            How this app counts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border-2 border-white/40 p-1.5 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-accent)"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(min(92vh,46rem)-3.5rem)] space-y-4 overflow-y-auto p-4 pb-10 text-sm font-medium leading-relaxed text-(--color-ink) dark:text-stone-200 sm:p-6 sm:pb-12">
          <p>
            <span className="font-display font-semibold text-(--color-accent) dark:text-red-300">Travel days.</span> For
            each trip, the calendar day you leave Canada and the calendar day you return both count as days <em>in</em>{" "}
            Canada. Only the days strictly between those two dates are treated as days abroad. IRCC describes the same
            idea for citizenship physical presence: departure and return days are not absences (you were in Canada for
            part of each day); only full calendar days with no time in Canada add to your absence total. That is how the
            Physical Presence Calculator and form CIT 0407 explain it. This app uses the same dates for PR rolling
            windows so your trips line up with that count.
          </p>
          <p>
            <span className="font-display font-semibold text-(--color-accent) dark:text-red-300">
              Permanent residence (730 days).
            </span>{" "}
            You need at least <strong className="tabular-nums">730</strong> days that count as “present for PR” in each
            relevant rolling window of <strong className="tabular-nums">1825</strong> consecutive calendar days (five
            years, ignoring leap nuance). The app scans those windows and uses your <strong>weakest</strong> window — if
            that one is still ≥ 730, you’re in the green. Trips can be tagged for PR exceptions (e.g. full-time abroad
            for a Canadian employer, accompanying a Canadian citizen spouse, crown service abroad) where those days may
            still count as “in Canada” for PR math, depending on your real eligibility. Always confirm with official
            rules.
          </p>
          <p>
            <span className="font-display font-semibold text-(--color-forest) dark:text-emerald-300">
              Citizenship physical presence (1095 days).
            </span>{" "}
            Citizenship applications look at physical presence in the last five years before you apply. This app
            approximates “credit” in that window: days physically in Canada <em>before</em> you became a PR count as{" "}
            <strong>half a day</strong> each, up to a maximum of <strong className="tabular-nums">365</strong> total
            credit from that pre-PR period. From your PR date onward, each qualifying day in Canada counts as{" "}
            <strong>one</strong> day. Work abroad for a private Canadian company does <strong>not</strong> earn
            citizenship physical presence here (unlike some PR exceptions); crown / public service abroad may, when you
            mark a trip that way and it applies to you.
          </p>
          <Button type="button" variant="default" className="mt-2 mb-1 sm:mb-2" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
