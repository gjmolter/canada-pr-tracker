"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import type { AbroadPrTreatment, Trip } from "@/lib/types";
import { ABROAD_OPTIONS } from "@/lib/abroad-options";
import { isChronologicallyValid } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";

interface TravelModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Trip | null;
  onSave: (trip: Omit<Trip, "id">) => void;
}

const defaultForm = {
  departureDate: "",
  returnDate: "",
  abroadPrTreatment: "none" as AbroadPrTreatment,
};

export function TravelModal({
  open,
  onClose,
  initial,
  onSave,
}: TravelModalProps) {
  const [form, setForm] = useState(defaultForm);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        departureDate: initial.departureDate,
        returnDate: initial.returnDate,
        abroadPrTreatment: initial.abroadPrTreatment,
      });
    } else {
      setForm(defaultForm);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
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

  const valid =
    form.departureDate &&
    form.returnDate &&
    isChronologicallyValid(form.departureDate, form.returnDate);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[color:var(--color-ink)]/50 p-3 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        className="bento bento--flat w-full max-w-lg overflow-hidden border-[color:var(--color-ink)] shadow-[8px_8px_0_0_var(--color-ink)] dark:shadow-[8px_8px_0_0_rgb(244_240_234/0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="travel-modal-title"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b-2 border-[color:var(--color-ink)] bg-[var(--color-accent)] px-4 py-3 text-white sm:px-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 shrink-0" />
            <h2 id="travel-modal-title" className="font-display text-lg font-bold">
              {initial ? "Tweak a trip" : "Log a hop"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border-2 border-white/40 p-1.5 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-accent)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="space-y-4 p-4 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({
              departureDate: form.departureDate,
              returnDate: form.returnDate,
              abroadPrTreatment: form.abroadPrTreatment,
            });
            onClose();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-ink)] dark:text-stone-200">
              Leave Canada
              <input
                type="date"
                className="input-bento"
                value={form.departureDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, departureDate: e.target.value }))
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-ink)] dark:text-stone-200">
              Back in Canada
              <input
                type="date"
                className="input-bento"
                value={form.returnDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, returnDate: e.target.value }))
                }
                required
              />
            </label>
          </div>
          <p className="text-xs font-medium leading-relaxed text-[var(--color-muted-ink)] dark:text-stone-400">
            Leave and return days count as in Canada; only full days between
            them count as abroad. That&apos;s the same absence rule IRCC uses for
            citizenship
            physical presence (calculator / CIT 0407).
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-ink)] dark:text-stone-200">
            Abroad flavour (for PR / citizenship math)
            <select
              className="input-bento"
              value={form.abroadPrTreatment}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  abroadPrTreatment: e.target.value as AbroadPrTreatment,
                }))
              }
            >
              {ABROAD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="text-xs font-medium normal-case text-[var(--color-muted-ink)] dark:text-stone-400">
              {
                ABROAD_OPTIONS.find((o) => o.value === form.abroadPrTreatment)
                  ?.hint
              }
            </span>
          </label>
          <div className="flex justify-end gap-2 border-t-2 border-dashed border-[color:var(--color-ink)]/15 pt-4 dark:border-stone-600/40">
            <Button type="button" variant="outline" onClick={onClose}>
              Never mind
            </Button>
            <Button type="submit" disabled={!valid}>
              Save it
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
