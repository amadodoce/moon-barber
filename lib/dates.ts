/** @deprecated Use @/lib/booking/timezone — kept for backward compatibility */

import { toDateString, parseBookingDate } from "@/lib/booking/timezone";

export {
  parseBookingDate as parseLocalDate,
  getTehranTodayString as getTodayLocalDateString,
  isTodayOrFutureInTehran as isTodayOrFuture,
  formatJalaliDate,
  formatFaDate,
  toDateString,
  parseBookingDate,
  getTehranTodayString,
  isTodayOrFutureInTehran,
} from "@/lib/booking/timezone";

/** Format Date as local "YYYY-MM-DD" (for UI Date objects) */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Normalize Date or "YYYY-MM-DD" string to UTC midnight Date */
export function toLocalDate(value: Date | string): Date {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return parseBookingDate(value);
    }
    return new Date(value);
  }
  return parseBookingDate(toDateString(value));
}

/** Jalali month + year label for calendar headers */
export function formatJalaliMonthYear(date: Date): string {
  return date.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
  });
}

/** Compare calendar day equality */
export function isSameLocalDate(a: Date | string, b: Date | string): boolean {
  const toStr = (v: Date | string) =>
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)
      ? v
      : toDateString(v);
  return toStr(a) === toStr(b);
}
