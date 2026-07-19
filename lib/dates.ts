/** Parse a date string "YYYY-MM-DD" to a Date at local midnight */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Format a Date as local "YYYY-MM-DD" */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's date as local "YYYY-MM-DD" */
export function getTodayLocalDateString(): string {
  return toLocalDateString(new Date());
}

/** Normalize Date or "YYYY-MM-DD" string to local Date at midnight */
export function toLocalDate(value: Date | string): Date {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return parseLocalDate(value);
    }
    return new Date(value);
  }
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

/** Format for Persian locale display */
export function formatFaDate(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = toLocalDate(value);
  return date.toLocaleDateString("fa-IR", options);
}

/** Compare calendar day equality in local timezone */
export function isSameLocalDate(a: Date | string, b: Date | string): boolean {
  return toLocalDateString(toLocalDate(a)) === toLocalDateString(toLocalDate(b));
}

/** Compare date-only string to today in local timezone */
export function isTodayOrFuture(dateStr: string): boolean {
  const selected = parseLocalDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}
