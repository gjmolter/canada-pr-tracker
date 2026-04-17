import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";

export const ISO_DATE = "yyyy-MM-dd";

export function parseDate(iso: string): Date | null {
  if (!iso) return null;
  const d = parseISO(iso);
  return isValid(d) ? startOfDay(d) : null;
}

export function toISODate(d: Date): string {
  return format(d, ISO_DATE);
}

export function daysBetweenInclusive(a: Date, b: Date): number {
  return differenceInCalendarDays(startOfDay(b), startOfDay(a)) + 1;
}

/** Calendar days strictly between departure and return (exclusive of both). */
export function outsideCalendarDays(departure: Date, ret: Date): Date[] {
  const start = addDays(startOfDay(departure), 1);
  const end = addDays(startOfDay(ret), -1);
  if (isAfter(start, end)) return [];
  return eachDayOfInterval({ start, end });
}

export function isChronologicallyValid(
  departureISO: string,
  returnISO: string
): boolean {
  const dep = parseDate(departureISO);
  const ret = parseDate(returnISO);
  if (!dep || !ret) return false;
  return !isBefore(ret, dep);
}
