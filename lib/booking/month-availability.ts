import {
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
  format as formatGregorian,
} from "date-fns-jalali";
import { toDateString } from "@/lib/booking/timezone";
import { computeMonthAvailability } from "@/lib/booking/engine";
import type {
  BusyAppointment,
  DayAvailability,
  HolidayRecord,
  WorkingHourRecord,
} from "@/lib/booking/types";

/** All Gregorian YYYY-MM-DD strings in a Jalali month */
export function getGregorianDatesInJalaliMonth(
  jalaliYear: number,
  jalaliMonth: number
): string[] {
  const monthStart = startOfMonth(new Date(jalaliYear, jalaliMonth - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  return eachDayOfInterval({ start: monthStart, end: monthEnd }).map((d) =>
    formatGregorian(d, "yyyy-MM-dd")
  );
}

/** Batch month availability from pre-fetched data */
export function getMonthAvailabilityFromData(
  jalaliYear: number,
  jalaliMonth: number,
  workingHours: WorkingHourRecord[],
  holidays: HolidayRecord[],
  appointments: Array<{ date: Date; startMinute: number; endMinute: number }>,
  barberId: string,
  durationMinutes: number
): DayAvailability[] {
  const dates = getGregorianDatesInJalaliMonth(jalaliYear, jalaliMonth);

  const appointmentsByDate = new Map<string, BusyAppointment[]>();
  for (const appt of appointments) {
    const key = toDateString(appt.date);
    const list = appointmentsByDate.get(key) ?? [];
    list.push({ startMinute: appt.startMinute, endMinute: appt.endMinute });
    appointmentsByDate.set(key, list);
  }

  return computeMonthAvailability(
    dates,
    workingHours,
    holidays,
    appointmentsByDate,
    barberId,
    durationMinutes
  );
}
