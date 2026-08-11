/** Re-export booking engine for legacy imports */
export type { AvailableSlot } from "@/lib/booking/types";
export { timeToMinutes, minutesToTime } from "@/lib/booking/time";
export { generateSlots, filterPastSlots } from "@/lib/booking/engine";
export { queryAvailableSlots as getAvailableSlots } from "@/lib/booking/queries";
export { parseBookingDate as parseLocalDate } from "@/lib/booking/timezone";

import { timeToMinutes, minutesToTime, minuteRangesOverlap } from "@/lib/booking/time";
import { subtractMinuteRanges } from "@/lib/booking/engine";

export interface TimeRange {
  start: string;
  end: string;
}

export function subtractRanges(
  available: TimeRange[],
  blocked: TimeRange[]
): TimeRange[] {
  const toMinute = (ranges: TimeRange[]) =>
    ranges.map((r) => ({
      startMinute: timeToMinutes(r.start),
      endMinute: timeToMinutes(r.end),
    }));

  return subtractMinuteRanges(toMinute(available), toMinute(blocked)).map((r) => ({
    start: minutesToTime(r.startMinute),
    end: minutesToTime(r.endMinute),
  }));
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return minuteRangesOverlap(
    timeToMinutes(a.start),
    timeToMinutes(a.end),
    timeToMinutes(b.start),
    timeToMinutes(b.end)
  );
}
