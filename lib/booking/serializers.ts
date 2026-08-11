import { minutesToTime } from "@/lib/booking/time";
import { toDateString } from "@/lib/booking/timezone";
import type { AvailableSlot } from "@/lib/booking/types";

/** Serialize appointment times for client display */
export function formatAppointmentTimeRange(
  startMinute: number,
  endMinute: number
): { startTime: string; endTime: string } {
  return {
    startTime: minutesToTime(startMinute),
    endTime: minutesToTime(endMinute),
  };
}

/** Enrich appointment record with HH:mm strings for UI */
export function withTimeLabels<T extends { startMinute: number; endMinute: number }>(
  record: T
): T & { startTime: string; endTime: string } {
  const { startTime, endTime } = formatAppointmentTimeRange(
    record.startMinute,
    record.endMinute
  );
  return { ...record, startTime, endTime };
}

/** Enrich working hour for admin display */
export function withWorkingHourLabels<
  T extends { startMinute: number; endMinute: number; specificDate?: Date | null },
>(record: T): T & { startTime: string; endTime: string; specificDateStr: string | null } {
  const { startTime, endTime } = formatAppointmentTimeRange(
    record.startMinute,
    record.endMinute
  );
  return {
    ...record,
    startTime,
    endTime,
    specificDateStr: record.specificDate
      ? toDateString(record.specificDate)
      : null,
  };
}

export type SerializedSlot = AvailableSlot;
