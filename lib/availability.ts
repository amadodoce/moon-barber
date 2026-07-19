import { prisma } from "@/lib/prisma";
import type { DayOfWeek } from "@/app/generated/prisma/enums";
import { parseLocalDate } from "@/lib/dates";

export { parseLocalDate } from "@/lib/dates";

/** A continuous time range in "HH:mm" format */
export interface TimeRange {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

/** A bookable slot for a customer */
export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

/** Convert JS Date day index (0=Sun) to Prisma DayOfWeek enum */
const DAY_MAP: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

/** Convert "HH:mm" string to minutes since midnight */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Convert minutes since midnight back to "HH:mm" */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Check if two time ranges overlap */
function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return timeToMinutes(a.start) < timeToMinutes(b.end) && timeToMinutes(b.start) < timeToMinutes(a.end);
}

/** Subtract a list of blocked ranges from an available range, returning free sub-ranges */
function subtractRanges(
  available: TimeRange[],
  blocked: TimeRange[]
): TimeRange[] {
  const result: TimeRange[] = [];

  for (const avail of available) {
    let current: TimeRange = { ...avail };

    // Sort blocked ranges by start time for this window
    const relevantBlocked = blocked
      .filter((b) => rangesOverlap(current, b))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    for (const block of relevantBlocked) {
      const currentStart = timeToMinutes(current.start);
      const currentEnd = timeToMinutes(current.end);
      const blockStart = timeToMinutes(block.start);
      const blockEnd = timeToMinutes(block.end);

      // Keep the part before the block
      if (blockStart > currentStart) {
        result.push({
          start: current.start,
          end: minutesToTime(Math.min(blockStart, currentEnd)),
        });
      }

      // Move current start past the block
      if (blockEnd < currentEnd) {
        current = { start: minutesToTime(blockEnd), end: current.end };
      } else {
        current = { start: current.end, end: current.end }; // Exhausted
      }
    }

    // Keep any remaining part
    if (timeToMinutes(current.start) < timeToMinutes(current.end)) {
      result.push(current);
    }
  }

  return result;
}

/** Generate time slots from available ranges given a service duration */
function generateSlots(
  ranges: TimeRange[],
  durationMinutes: number,
  stepMinutes: number = 15
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];

  for (const range of ranges) {
    let start = timeToMinutes(range.start);
    const end = timeToMinutes(range.end);

    while (start + durationMinutes <= end) {
      slots.push({
        startTime: minutesToTime(start),
        endTime: minutesToTime(start + durationMinutes),
      });
      start += stepMinutes;
    }
  }

  return slots;
}

/**
 * Get available booking slots for a given barber, services, and date.
 *
 * Algorithm:
 * 1. Fetch working hours for the barber on this day of week
 * 2. Fetch holidays that overlap this date
 * 3. Fetch existing appointments for this barber on this date
 * 4. Calculate total service duration from selected serviceIds
 * 5. Subtract holidays and appointments from working hour ranges
 * 6. Generate bookable slots from remaining ranges
 */
export async function getAvailableSlots(
  barberId: string,
  serviceIds: string[],
  date: string
): Promise<AvailableSlot[]> {
  // Parse date string and create Date at local midnight (not UTC)
  const dateObj = parseLocalDate(date);
  const dayOfWeek = DAY_MAP[dateObj.getDay()];

  // 1. Fetch services to calculate total duration
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      isActive: true,
      deletedAt: null,
    },
  });

  if (services.length !== serviceIds.length) {
    throw new Error("یک یا چند سرویس نامعتبر است");
  }

  const totalDuration = services.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );

  // 2. Fetch working hours — barber-specific first, fall back to shop-wide
  let workingHours = await prisma.workingHour.findMany({
    where: {
      barberId,
      dayOfWeek,
      isActive: true,
      isRecurring: true,
      specificDate: null,
    },
  });

  // Also check for a specific date override
  const specificOverrides = await prisma.workingHour.findMany({
    where: {
      barberId,
      isActive: true,
      isRecurring: false,
      specificDate: dateObj,
    },
  });

  if (specificOverrides.length > 0) {
    workingHours = specificOverrides;
  }

  // If no barber-specific hours, use shop-wide hours
  if (workingHours.length === 0) {
    workingHours = await prisma.workingHour.findMany({
      where: {
        barberId: null,
        dayOfWeek,
        isActive: true,
        isRecurring: true,
        specificDate: null,
      },
    });

    const shopSpecificOverrides = await prisma.workingHour.findMany({
      where: {
        barberId: null,
        isActive: true,
        isRecurring: false,
        specificDate: dateObj,
      },
    });

    if (shopSpecificOverrides.length > 0) {
      workingHours = shopSpecificOverrides;
    }
  }

  // If no working hours at all, no slots available
  if (workingHours.length === 0) {
    return [];
  }

  const availableRanges: TimeRange[] = workingHours.map((wh) => ({
    start: wh.startTime,
    end: wh.endTime,
  }));

  // 3. Fetch holidays for this date
  const holidays = await prisma.holiday.findMany({
    where: {
      OR: [{ barberId }, { barberId: null }],
      date: dateObj,
    },
  });

  const holidayRanges: TimeRange[] = [];
  for (const holiday of holidays) {
    if (holiday.type === "FULL_DAY") {
      // Full day holiday blocks everything
      return [];
    }
    if (holiday.startTime && holiday.endTime) {
      holidayRanges.push({
        start: holiday.startTime,
        end: holiday.endTime,
      });
    }
  }

  // Subtract holidays
  let freeRanges = subtractRanges(availableRanges, holidayRanges);

  // 4. Fetch existing appointments for this barber on this date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      date: dateObj,
      status: { notIn: ["CANCELLED"] },
      deletedAt: null,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const appointmentRanges: TimeRange[] = existingAppointments.map((appt) => ({
    start: appt.startTime,
    end: appt.endTime,
  }));

  // Subtract existing appointments
  freeRanges = subtractRanges(freeRanges, appointmentRanges);

  // 5. Generate bookable slots
  return generateSlots(freeRanges, totalDuration);
}
