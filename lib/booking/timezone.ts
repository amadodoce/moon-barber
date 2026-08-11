const TEHRAN_TZ = "Asia/Tehran";

/** Current instant as parts in Tehran timezone */
function tehranParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TEHRAN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
  };
}

/** Today in Tehran as YYYY-MM-DD (Gregorian storage) */
export function getTehranTodayString(): string {
  const { year, month, day } = tehranParts();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Current minutes since midnight in Tehran */
export function getTehranNowMinutes(): number {
  const { hour, minute } = tehranParts();
  return hour * 60 + minute;
}

/** Parse YYYY-MM-DD to UTC Date at calendar midnight (for @db.Date storage) */
export function parseBookingDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Format Date or YYYY-MM-DD to YYYY-MM-DD */
export function toDateString(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = typeof value === "string" ? new Date(value) : value;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Day-of-week index (0=Sun … 6=Sat) from YYYY-MM-DD */
export function getUtcDayIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isTodayOrFutureInTehran(dateStr: string): boolean {
  return dateStr >= getTehranTodayString();
}

/** Jalali calendar presentation */
export function formatJalaliDate(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateStr = typeof value === "string" ? value : toDateString(value);
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return date.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatFaDate(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateStr = typeof value === "string" ? value : toDateString(value);
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return date.toLocaleDateString("fa-IR", options);
}
