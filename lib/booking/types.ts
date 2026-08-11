import type { DayOfWeek } from "@/app/generated/prisma/enums";

/** A continuous minute range [startMinute, endMinute) */
export interface MinuteRange {
  startMinute: number;
  endMinute: number;
}

/** A bookable slot exposed to the client */
export interface AvailableSlot {
  startTime: string;
  endTime: string;
  startMinute: number;
  endMinute: number;
}

export type DayAvailabilityStatus = "closed" | "full" | "available" | "past";

export interface DayAvailability {
  date: string;
  status: DayAvailabilityStatus;
}

export interface WorkingHourRecord {
  barberId: string | null;
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
  isRecurring: boolean;
  specificDate: Date | null;
  isActive: boolean;
}

export interface HolidayRecord {
  barberId: string | null;
  date: Date;
  startMinute: number | null;
  endMinute: number | null;
  type: "FULL_DAY" | "TIME_RANGE";
}

export interface BusyAppointment {
  startMinute: number;
  endMinute: number;
}
