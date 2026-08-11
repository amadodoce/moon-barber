import type { DayOfWeek } from "@/app/generated/prisma/enums";
import { getUtcDayIndex, getTehranNowMinutes, getTehranTodayString } from "@/lib/booking/timezone";
import { minutesToTime, minuteRangesOverlap } from "@/lib/booking/time";
import type {
  AvailableSlot,
  BusyAppointment,
  DayAvailability,
  DayAvailabilityStatus,
  HolidayRecord,
  MinuteRange,
  WorkingHourRecord,
} from "@/lib/booking/types";

const DAY_MAP: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function getDayOfWeek(dateStr: string): DayOfWeek {
  return DAY_MAP[getUtcDayIndex(dateStr)];
}

/** Subtract blocked minute ranges from available ranges */
export function subtractMinuteRanges(
  available: MinuteRange[],
  blocked: MinuteRange[]
): MinuteRange[] {
  const result: MinuteRange[] = [];

  for (const avail of available) {
    let current = { ...avail };

    const relevantBlocked = blocked
      .filter((b) =>
        minuteRangesOverlap(
          current.startMinute,
          current.endMinute,
          b.startMinute,
          b.endMinute
        )
      )
      .sort((a, b) => a.startMinute - b.startMinute);

    for (const block of relevantBlocked) {
      if (block.startMinute > current.startMinute) {
        result.push({
          startMinute: current.startMinute,
          endMinute: Math.min(block.startMinute, current.endMinute),
        });
      }

      if (block.endMinute < current.endMinute) {
        current = { startMinute: block.endMinute, endMinute: current.endMinute };
      } else {
        current = { startMinute: current.endMinute, endMinute: current.endMinute };
      }
    }

    if (current.startMinute < current.endMinute) {
      result.push(current);
    }
  }

  return result;
}

/** Generate bookable slots from free ranges */
export function generateSlots(
  ranges: MinuteRange[],
  durationMinutes: number,
  stepMinutes = 15
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];

  for (const range of ranges) {
    let start = range.startMinute;
    while (start + durationMinutes <= range.endMinute) {
      const end = start + durationMinutes;
      slots.push({
        startMinute: start,
        endMinute: end,
        startTime: minutesToTime(start),
        endTime: minutesToTime(end),
      });
      start += stepMinutes;
    }
  }

  return slots;
}

export function filterPastSlots(
  slots: AvailableSlot[],
  dateStr: string
): AvailableSlot[] {
  if (dateStr !== getTehranTodayString()) {
    return slots;
  }
  const nowMinutes = getTehranNowMinutes();
  return slots.filter((slot) => slot.startMinute > nowMinutes);
}

/** Resolve working hours for a barber on a specific date */
export function resolveWorkingHours(
  allHours: WorkingHourRecord[],
  barberId: string,
  dateStr: string
): MinuteRange[] {
  const dayOfWeek = getDayOfWeek(dateStr);

  const barberSpecific = allHours.filter((wh) => wh.barberId === barberId && wh.isActive);
  const shopWide = allHours.filter((wh) => wh.barberId === null && wh.isActive);

  const specificOverride = barberSpecific.filter(
    (wh) =>
      !wh.isRecurring &&
      wh.specificDate &&
      wh.specificDate.toISOString().slice(0, 10) === dateStr
  );

  if (specificOverride.length > 0) {
    return specificOverride.map((wh) => ({
      startMinute: wh.startMinute,
      endMinute: wh.endMinute,
    }));
  }

  let recurring = barberSpecific.filter(
    (wh) => wh.isRecurring && wh.dayOfWeek === dayOfWeek && !wh.specificDate
  );

  if (recurring.length === 0) {
    const shopSpecific = shopWide.filter(
      (wh) =>
        !wh.isRecurring &&
        wh.specificDate &&
        wh.specificDate.toISOString().slice(0, 10) === dateStr
    );

    if (shopSpecific.length > 0) {
      return shopSpecific.map((wh) => ({
        startMinute: wh.startMinute,
        endMinute: wh.endMinute,
      }));
    }

    recurring = shopWide.filter(
      (wh) => wh.isRecurring && wh.dayOfWeek === dayOfWeek && !wh.specificDate
    );
  }

  return recurring.map((wh) => ({
    startMinute: wh.startMinute,
    endMinute: wh.endMinute,
  }));
}

/** Apply holidays to working hour ranges */
export function applyHolidays(
  ranges: MinuteRange[],
  holidays: HolidayRecord[],
  dateStr: string
): MinuteRange[] {
  const dayHolidays = holidays.filter(
    (h) => h.date.toISOString().slice(0, 10) === dateStr
  );

  for (const holiday of dayHolidays) {
    if (holiday.type === "FULL_DAY") {
      return [];
    }
  }

  const blocked: MinuteRange[] = dayHolidays
    .filter(
      (h) =>
        h.type === "TIME_RANGE" &&
        h.startMinute != null &&
        h.endMinute != null
    )
    .map((h) => ({
      startMinute: h.startMinute!,
      endMinute: h.endMinute!,
    }));

  return subtractMinuteRanges(ranges, blocked);
}

/** Subtract busy appointments from free ranges */
export function applyBusyAppointments(
  ranges: MinuteRange[],
  appointments: BusyAppointment[]
): MinuteRange[] {
  const blocked = appointments.map((a) => ({
    startMinute: a.startMinute,
    endMinute: a.endMinute,
  }));
  return subtractMinuteRanges(ranges, blocked);
}

/** Pure slot computation for one day */
export function computeDaySlots(
  workingHours: WorkingHourRecord[],
  holidays: HolidayRecord[],
  appointments: BusyAppointment[],
  barberId: string,
  dateStr: string,
  durationMinutes: number
): AvailableSlot[] {
  let ranges = resolveWorkingHours(workingHours, barberId, dateStr);
  if (ranges.length === 0) return [];

  ranges = applyHolidays(ranges, holidays, dateStr);
  if (ranges.length === 0) return [];

  ranges = applyBusyAppointments(ranges, appointments);
  if (ranges.length === 0) return [];

  return filterPastSlots(generateSlots(ranges, durationMinutes), dateStr);
}

/** Check if a specific slot is available */
export function isSlotAvailable(
  slots: AvailableSlot[],
  startMinute: number
): boolean {
  return slots.some((s) => s.startMinute === startMinute);
}

/** Check appointment overlap using minute ranges */
export function hasAppointmentOverlap(
  existing: BusyAppointment[],
  startMinute: number,
  endMinute: number
): boolean {
  return existing.some((a) =>
    minuteRangesOverlap(a.startMinute, a.endMinute, startMinute, endMinute)
  );
}

/** Compute day status for calendar preview */
export function computeDayStatus(
  workingHours: WorkingHourRecord[],
  holidays: HolidayRecord[],
  appointments: BusyAppointment[],
  barberId: string,
  dateStr: string,
  durationMinutes: number
): DayAvailabilityStatus {
  if (dateStr < getTehranTodayString()) {
    return "past";
  }

  const slots = computeDaySlots(
    workingHours,
    holidays,
    appointments,
    barberId,
    dateStr,
    durationMinutes
  );

  if (slots.length > 0) return "available";

  const ranges = resolveWorkingHours(workingHours, barberId, dateStr);
  if (ranges.length === 0) return "closed";

  const afterHolidays = applyHolidays(ranges, holidays, dateStr);
  if (afterHolidays.length === 0) return "closed";

  return "full";
}

/** Compute availability for a list of dates (month batch) */
export function computeMonthAvailability(
  dates: string[],
  workingHours: WorkingHourRecord[],
  holidays: HolidayRecord[],
  appointmentsByDate: Map<string, BusyAppointment[]>,
  barberId: string,
  durationMinutes: number
): DayAvailability[] {
  return dates.map((date) => ({
    date,
    status: computeDayStatus(
      workingHours,
      holidays,
      appointmentsByDate.get(date) ?? [],
      barberId,
      date,
      durationMinutes
    ),
  }));
}

/** Validate working hour ranges don't overlap on same day/barber */
export function workingHoursWouldOverlap(
  existing: Array<{ startMinute: number; endMinute: number; id?: string }>,
  candidate: { startMinute: number; endMinute: number; id?: string }
): boolean {
  return existing.some(
    (wh) =>
      wh.id !== candidate.id &&
      minuteRangesOverlap(
        wh.startMinute,
        wh.endMinute,
        candidate.startMinute,
        candidate.endMinute
      )
  );
}
