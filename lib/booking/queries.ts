import { prisma } from "@/lib/prisma";
import { parseBookingDate, toDateString } from "@/lib/booking/timezone";
import { computeDaySlots } from "@/lib/booking/engine";
import { getMonthAvailabilityFromData } from "@/lib/booking/month-availability";
import type {
  AvailableSlot,
  DayAvailability,
  HolidayRecord,
  WorkingHourRecord,
} from "@/lib/booking/types";

async function fetchServiceDuration(serviceIds: string[]): Promise<number> {
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

  return services.reduce((sum, s) => sum + s.durationMinutes, 0);
}

async function fetchWorkingHours(barberId: string): Promise<WorkingHourRecord[]> {
  const rows = await prisma.workingHour.findMany({
    where: {
      OR: [{ barberId }, { barberId: null }],
      isActive: true,
    },
  });

  return rows.map((wh) => ({
    barberId: wh.barberId,
    dayOfWeek: wh.dayOfWeek,
    startMinute: wh.startMinute,
    endMinute: wh.endMinute,
    isRecurring: wh.isRecurring,
    specificDate: wh.specificDate,
    isActive: wh.isActive,
  }));
}

async function fetchHolidays(
  barberId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<HolidayRecord[]> {
  const rows = await prisma.holiday.findMany({
    where: {
      OR: [{ barberId }, { barberId: null }],
      date: { gte: dateFrom, lte: dateTo },
    },
  });

  return rows.map((h) => ({
    barberId: h.barberId,
    date: h.date,
    startMinute: h.startMinute,
    endMinute: h.endMinute,
    type: h.type,
  }));
}

async function fetchBusyAppointments(
  barberId: string,
  dateFrom: Date,
  dateTo: Date
) {
  return prisma.appointment.findMany({
    where: {
      barberId,
      date: { gte: dateFrom, lte: dateTo },
      status: { notIn: ["CANCELLED"] },
      deletedAt: null,
    },
    select: {
      date: true,
      startMinute: true,
      endMinute: true,
    },
  });
}

/** Get available slots for one day — 4 queries total */
export async function queryAvailableSlots(
  barberId: string,
  serviceIds: string[],
  dateStr: string
): Promise<AvailableSlot[]> {
  const durationMinutes = await fetchServiceDuration(serviceIds);
  const dateObj = parseBookingDate(dateStr);

  const [workingHours, holidays, appointments] = await Promise.all([
    fetchWorkingHours(barberId),
    fetchHolidays(barberId, dateObj, dateObj),
    fetchBusyAppointments(barberId, dateObj, dateObj),
  ]);

  return computeDaySlots(
    workingHours,
    holidays,
    appointments.map((a) => ({
      startMinute: a.startMinute,
      endMinute: a.endMinute,
    })),
    barberId,
    dateStr,
    durationMinutes
  );
}

/** Get month availability — batch queries */
export async function queryMonthAvailability(
  barberId: string,
  serviceIds: string[],
  jalaliYear: number,
  jalaliMonth: number
): Promise<DayAvailability[]> {
  const durationMinutes = await fetchServiceDuration(serviceIds);

  const { getGregorianDatesInJalaliMonth } = await import(
    "@/lib/booking/month-availability"
  );
  const dates = getGregorianDatesInJalaliMonth(jalaliYear, jalaliMonth);
  if (dates.length === 0) return [];

  const dateFrom = parseBookingDate(dates[0]);
  const dateTo = parseBookingDate(dates[dates.length - 1]);

  const [workingHours, holidays, appointments] = await Promise.all([
    fetchWorkingHours(barberId),
    fetchHolidays(barberId, dateFrom, dateTo),
    fetchBusyAppointments(barberId, dateFrom, dateTo),
  ]);

  return getMonthAvailabilityFromData(
    jalaliYear,
    jalaliMonth,
    workingHours,
    holidays,
    appointments,
    barberId,
    durationMinutes
  );
}

/** Fetch data needed for in-transaction slot validation */
export async function queryDayBookingContext(
  barberId: string,
  serviceIds: string[],
  dateStr: string
) {
  const durationMinutes = await fetchServiceDuration(serviceIds);
  const dateObj = parseBookingDate(dateStr);

  const [workingHours, holidays, appointments] = await Promise.all([
    fetchWorkingHours(barberId),
    fetchHolidays(barberId, dateObj, dateObj),
    prisma.appointment.findMany({
      where: {
        barberId,
        date: dateObj,
        status: { notIn: ["CANCELLED"] },
        deletedAt: null,
      },
      select: { startMinute: true, endMinute: true },
    }),
  ]);

  return {
    durationMinutes,
    dateObj,
    workingHours,
    holidays,
    appointments,
  };
}

export { toDateString };
