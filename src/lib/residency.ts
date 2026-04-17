import {
  addDays,
  differenceInCalendarDays,
  max as dfMax,
  min as dfMin,
} from "date-fns";
import type { AbroadPrTreatment, TrackerProfile, Trip } from "./types";
import { parseDate, toISODate } from "./dateUtils";

const WINDOW_DAYS = 1825;
export const PR_REQUIRED = 730;
export const CIT_REQUIRED = 1095;
export const MAX_TEMP_CREDIT = 365;

export interface DayFlags {
  date: Date;
  prCredit: 0 | 1;
  physicalCanadaCitizenship: boolean;
}

/** Pre-parsed trip: abroad segment as inclusive calendar day timestamps (startOfDay). */
interface ParsedTrip {
  hasOutside: boolean;
  /** Inclusive first day abroad (ms); only valid if hasOutside */
  os: number;
  /** Inclusive last day abroad (ms) */
  oe: number;
  treatment: AbroadPrTreatment;
}

function abroadPrCredit(treatment: AbroadPrTreatment): 0 | 1 {
  switch (treatment) {
    case "none":
      return 0;
    case "canadian_employer":
    case "accompany_citizen":
    case "crown_employee":
      return 1;
    default:
      return 0;
  }
}

function abroadCountsAsCanadaCitizenship(
  treatment: AbroadPrTreatment
): boolean {
  return treatment === "crown_employee";
}

function parseTrips(trips: Trip[]): ParsedTrip[] {
  const out: ParsedTrip[] = [];
  for (const t of trips) {
    const dep = parseDate(t.departureDate);
    const ret = parseDate(t.returnDate);
    if (!dep || !ret || ret < dep) continue;
    const osD = addDays(dep, 1);
    const oeD = addDays(ret, -1);
    if (osD > oeD) {
      out.push({
        hasOutside: false,
        os: 0,
        oe: 0,
        treatment: t.abroadPrTreatment,
      });
    } else {
      out.push({
        hasOutside: true,
        os: osD.getTime(),
        oe: oeD.getTime(),
        treatment: t.abroadPrTreatment,
      });
    }
  }
  return out;
}

function layersAtDay(t: number, parsed: ParsedTrip[]): ParsedTrip[] {
  const hit: ParsedTrip[] = [];
  for (const p of parsed) {
    if (!p.hasOutside) continue;
    if (t >= p.os && t <= p.oe) hit.push(p);
  }
  return hit;
}

function prCreditForDay(
  dayMs: number,
  arrivalMs: number,
  parsed: ParsedTrip[]
): 0 | 1 {
  if (dayMs < arrivalMs) return 0;
  const layers = layersAtDay(dayMs, parsed);
  if (layers.length === 0) return 1;
  return Math.min(...layers.map((p) => abroadPrCredit(p.treatment))) as 0 | 1;
}

function physicalCanadaForDay(
  dayMs: number,
  arrivalMs: number,
  parsed: ParsedTrip[]
): boolean {
  if (dayMs < arrivalMs) return false;
  const layers = layersAtDay(dayMs, parsed);
  if (layers.length === 0) return true;
  return layers.every((p) => abroadCountsAsCanadaCitizenship(p.treatment));
}

export function buildDayFlags(
  d: Date,
  trips: Trip[],
  arrival: Date
): DayFlags {
  return buildDayFlagsParsed(d, parseTrips(trips), arrival);
}

function buildDayFlagsParsed(
  d: Date,
  parsed: ParsedTrip[],
  arrival: Date
): DayFlags {
  const dt = d.getTime();
  const at = arrival.getTime();
  if (dt < at) {
    return { date: d, prCredit: 0, physicalCanadaCitizenship: false };
  }
  const layers = layersAtDay(dt, parsed);
  if (layers.length === 0) {
    return { date: d, prCredit: 1, physicalCanadaCitizenship: true };
  }
  const prCredit = Math.min(
    ...layers.map((p) => abroadPrCredit(p.treatment))
  ) as 0 | 1;
  const physicalCanadaCitizenship = layers.every((p) =>
    abroadCountsAsCanadaCitizenship(p.treatment)
  );
  return { date: d, prCredit, physicalCanadaCitizenship };
}

/** PR credit for each calendar day from seriesStart through endLimit (inclusive), as Uint8Array indices. */
function buildPrCreditSeries(
  parsed: ParsedTrip[],
  arrival: Date,
  seriesStart: Date,
  endLimit: Date
): Uint8Array {
  const n = differenceInCalendarDays(endLimit, seriesStart) + 1;
  const credits = new Uint8Array(n);
  const arrivalMs = arrival.getTime();
  for (let i = 0; i < n; i++) {
    const d = addDays(seriesStart, i);
    credits[i] = prCreditForDay(d.getTime(), arrivalMs, parsed);
  }
  return credits;
}

export function minPrWindowSum(
  trips: Trip[],
  arrival: Date,
  asOf: Date
): { minSum: number; worstWindowEnd: Date | null } {
  const parsed = parseTrips(trips);
  const endLimit = asOf;
  const seriesStart = dfMin([arrival, addDays(endLimit, -(WINDOW_DAYS - 1))]);
  const credits = buildPrCreditSeries(parsed, arrival, seriesStart, endLimit);
  const n = credits.length;

  const firstEnd = addDays(arrival, WINDOW_DAYS - 1);
  if (firstEnd > endLimit) {
    let partial = 0;
    for (let i = 0; i < n; i++) partial += credits[i];
    return { minSum: partial, worstWindowEnd: endLimit };
  }

  const firstEndIdx = differenceInCalendarDays(firstEnd, seriesStart);
  const startIdx = firstEndIdx - (WINDOW_DAYS - 1);
  let win = 0;
  for (let i = 0; i < WINDOW_DAYS; i++) {
    win += credits[startIdx + i];
  }
  let minSum = win;
  let worstEndIdx = firstEndIdx;

  for (let endIdx = firstEndIdx + 1; endIdx < n; endIdx++) {
    win += credits[endIdx] - credits[endIdx - WINDOW_DAYS];
    if (win < minSum) {
      minSum = win;
      worstEndIdx = endIdx;
    }
  }

  return {
    minSum,
    worstWindowEnd: addDays(seriesStart, worstEndIdx),
  };
}

export interface PRStatusResult {
  status: "safe" | "at_risk" | "insufficient_history";
  minWindowSum: number;
  marginDays: number;
  worstWindowEnd: Date | null;
  maxFutureOutsideSpanIfDepartOnAsOf: number;
}

export function calculatePRStatus(
  trips: Trip[],
  profile: TrackerProfile,
  asOf: Date
): PRStatusResult | null {
  const arrival = parseDate(profile.arrivalDate);
  if (!arrival) return null;
  if (asOf < arrival) return null;

  const { minSum, worstWindowEnd } = minPrWindowSum(trips, arrival, asOf);
  const marginDays = minSum - PR_REQUIRED;

  const firstEnd = addDays(arrival, WINDOW_DAYS - 1);
  const insufficient = asOf < firstEnd;

  const status: PRStatusResult["status"] = insufficient
    ? "insufficient_history"
    : minSum >= PR_REQUIRED
      ? "safe"
      : "at_risk";

  const maxSpan = maxFutureOutsideSpan(trips, arrival, asOf);

  return {
    status,
    minWindowSum: minSum,
    marginDays,
    worstWindowEnd,
    maxFutureOutsideSpanIfDepartOnAsOf: maxSpan,
  };
}

function cloneTripsWithSynthetic(
  trips: Trip[],
  dep: Date,
  ret: Date,
  treatment: AbroadPrTreatment
): Trip[] {
  return [
    ...trips,
    {
      id: "__synthetic__",
      departureDate: toISODate(dep),
      returnDate: toISODate(ret),
      abroadPrTreatment: treatment,
    },
  ];
}

function maxFutureOutsideSpan(
  trips: Trip[],
  arrival: Date,
  asOf: Date
): number {
  let lo = 0;
  let hi = WINDOW_DAYS;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const ret = addDays(asOf, mid + 1);
    const synth = cloneTripsWithSynthetic(trips, asOf, ret, "none");
    const evalEnd = dfMax([asOf, ret]);
    const { minSum } = minPrWindowSum(synth, arrival, evalEnd);
    if (minSum >= PR_REQUIRED) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

export interface CitizenshipResult {
  totalEligibleDays: number;
  daysRemaining: number;
  tempCreditUsed: number;
  estimatedEligibleDate: Date | null;
}

const MAX_CITIZENSHIP_ETA_SIM_DAYS = 365 * 25;

function buildCitizenshipTotalsByDay(
  parsed: ParsedTrip[],
  arrival: Date,
  prDate: Date | null,
  asOf: Date,
  horizonEnd: Date
): Array<{ date: Date; totalEligibleDays: number; tempCreditUsed: number }> {
  const seriesStart = dfMax([arrival, addDays(asOf, -(WINDOW_DAYS - 1))]);
  const n = differenceInCalendarDays(horizonEnd, seriesStart) + 1;
  if (n <= 0) return [];

  const arrivalMs = arrival.getTime();
  const prMs = prDate ? prDate.getTime() : null;

  const pre = new Uint16Array(n);
  const post = new Uint16Array(n);
  for (let i = 0; i < n; i++) {
    const d = addDays(seriesStart, i);
    const dt = d.getTime();
    if (!physicalCanadaForDay(dt, arrivalMs, parsed)) continue;
    if (prMs !== null && dt >= prMs) post[i] = 1;
    else pre[i] = 1;
  }

  const totals: Array<{ date: Date; totalEligibleDays: number; tempCreditUsed: number }> = [];
  let preSum = 0;
  let postSum = 0;
  for (let endIdx = 0; endIdx < n; endIdx++) {
    preSum += pre[endIdx];
    postSum += post[endIdx];
    if (endIdx >= WINDOW_DAYS) {
      preSum -= pre[endIdx - WINDOW_DAYS];
      postSum -= post[endIdx - WINDOW_DAYS];
    }

    const tempCreditUsed = Math.min(MAX_TEMP_CREDIT, preSum * 0.5);
    totals.push({
      date: addDays(seriesStart, endIdx),
      totalEligibleDays: tempCreditUsed + postSum,
      tempCreditUsed,
    });
  }
  return totals;
}

export function calculateCitizenshipEligibility(
  trips: Trip[],
  profile: TrackerProfile,
  asOf: Date
): CitizenshipResult | null {
  const arrival = parseDate(profile.arrivalDate);
  if (!arrival) return null;
  if (asOf < arrival) return null;
  const prDate = profile.prDate ? parseDate(profile.prDate) : null;
  if (!prDate) return null;

  const parsed = parseTrips(trips);
  const horizonEnd = addDays(asOf, MAX_CITIZENSHIP_ETA_SIM_DAYS);
  const totalsByDay = buildCitizenshipTotalsByDay(
    parsed,
    arrival,
    prDate,
    asOf,
    horizonEnd
  );
  if (totalsByDay.length === 0) return null;

  const asOfTotals =
    totalsByDay.find((entry) => entry.date.getTime() === asOf.getTime()) ??
    totalsByDay[totalsByDay.length - 1];
  const totalEligibleDays = asOfTotals.totalEligibleDays;
  const tempCreditUsed = asOfTotals.tempCreditUsed;
  const daysRemaining = Math.max(0, CIT_REQUIRED - totalEligibleDays);

  // No PR date means future accrual assumptions are unknown in this model.
  const estimatedEligibleDate =
    daysRemaining === 0
      ? asOf
      : (totalsByDay.find(
          (entry) =>
            entry.date >= asOf && entry.totalEligibleDays >= CIT_REQUIRED
        )?.date ?? null);

  return {
    totalEligibleDays,
    daysRemaining,
    tempCreditUsed,
    estimatedEligibleDate,
  };
}

export interface MaxStayOutResult {
  latestFeasibleReturn: Date | null;
  outsideDays: number;
}

export function calculateMaxStayOut(
  trips: Trip[],
  profile: TrackerProfile,
  departure: Date
): MaxStayOutResult | null {
  const arrival = parseDate(profile.arrivalDate);
  if (!arrival) return null;
  const span = maxFutureOutsideSpan(trips, arrival, departure);
  const ret = addDays(departure, span + 1);
  return { latestFeasibleReturn: ret, outsideDays: span };
}
