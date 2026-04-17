import { isBefore, parseISO, isValid } from "date-fns";
import type { TrackerProfile, Trip } from "./types";
import { parseDate } from "./dateUtils";

export type IntegritySeverity = "error" | "warning";

export interface IntegrityMessage {
  id: string;
  severity: IntegritySeverity;
  message: string;
}

function isoValid(s: string): boolean {
  if (!s) return false;
  return isValid(parseISO(s));
}

export function runIntegrityChecks(
  profile: TrackerProfile,
  trips: Trip[]
): IntegrityMessage[] {
  const msgs: IntegrityMessage[] = [];
  const arrival = parseDate(profile.arrivalDate);
  const pr = profile.prDate ? parseDate(profile.prDate) : null;

  if (profile.arrivalDate && !isoValid(profile.arrivalDate)) {
    msgs.push({
      id: "arrival-invalid",
      severity: "error",
      message: "Original arrival date is not a valid calendar date.",
    });
  }

  if (profile.prDate && !isoValid(profile.prDate)) {
    msgs.push({
      id: "pr-invalid",
      severity: "error",
      message: "PR date is not a valid calendar date.",
    });
  }

  if (arrival && pr && isBefore(pr, arrival)) {
    msgs.push({
      id: "pr-before-arrival",
      severity: "warning",
      message: "PR date is before your recorded arrival in Canada.",
    });
  }

  trips.forEach((trip, idx) => {
    const dep = parseDate(trip.departureDate);
    const ret = parseDate(trip.returnDate);
    if (!dep || !ret) {
      msgs.push({
        id: `trip-${trip.id}-bad-dates`,
        severity: "error",
        message: `Trip #${idx + 1} has invalid dates.`,
      });
      return;
    }
    if (isBefore(ret, dep)) {
      msgs.push({
        id: `trip-${trip.id}-return-before-dep`,
        severity: "error",
        message: `Trip #${idx + 1}: return is before departure.`,
      });
    }
    if (arrival && isBefore(dep, arrival)) {
      msgs.push({
        id: `trip-${trip.id}-before-arrival`,
        severity: "warning",
        message: `Trip #${idx + 1}: departure is before your arrival date.`,
      });
    }
  });

  for (let i = 0; i < trips.length; i++) {
    for (let j = i + 1; j < trips.length; j++) {
      const a = trips[i];
      const b = trips[j];
      const aDep = parseDate(a.departureDate);
      const aRet = parseDate(a.returnDate);
      const bDep = parseDate(b.departureDate);
      const bRet = parseDate(b.returnDate);
      if (!aDep || !aRet || !bDep || !bRet) continue;
      const overlap =
        !(isBefore(aRet, bDep) || isBefore(bRet, aDep));
      if (overlap) {
        msgs.push({
          id: `overlap-${a.id}-${b.id}`,
          severity: "warning",
          message: `Trips #${i + 1} and #${j + 1} appear to overlap; results may be conservative.`,
        });
      }
    }
  }

  return msgs;
}
