"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  handleActionError,
  type ActionResponse,
} from "@/lib/auth-utils";
import {
  createHolidaySchema,
  updateHolidaySchema,
  holidayIdSchema,
  toHolidayMinutes,
  type CreateHolidayInput,
  type UpdateHolidayInput,
} from "@/lib/validations/holiday";
import { parseBookingDate } from "@/lib/booking/timezone";
import { minutesToTime } from "@/lib/booking/time";
import type { Holiday } from "@/app/generated/prisma/client";

type HolidayWithLabels = Holiday & {
  startTime: string | null;
  endTime: string | null;
};

function labelHoliday(h: Holiday): HolidayWithLabels {
  return {
    ...h,
    startTime: h.startMinute != null ? minutesToTime(h.startMinute) : null,
    endTime: h.endMinute != null ? minutesToTime(h.endMinute) : null,
  };
}

export async function createHoliday(
  input: CreateHolidayInput
): Promise<ActionResponse<HolidayWithLabels>> {
  try {
    await requireAdmin();
    const data = createHolidaySchema.parse(input);

    if (data.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { id: data.barberId },
      });
      if (!barber) throw new Error("آرایشگر یافت نشد");
    }

    const { startMinute, endMinute } = toHolidayMinutes({
      type: data.type ?? "FULL_DAY",
      startTime: data.startTime,
      endTime: data.endTime,
    });

    const holiday = await prisma.holiday.create({
      data: {
        barberId: data.barberId ?? null,
        title: data.title,
        date: parseBookingDate(data.date),
        startMinute,
        endMinute,
        type: data.type ?? "FULL_DAY",
      },
    });

    revalidatePath("/admin/schedule");
    return { success: true, data: labelHoliday(holiday) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateHoliday(
  input: UpdateHolidayInput
): Promise<ActionResponse<HolidayWithLabels>> {
  try {
    await requireAdmin();
    const data = updateHolidaySchema.parse(input);
    const { id, ...updateData } = data;

    const existing = await prisma.holiday.findUnique({ where: { id } });
    if (!existing) throw new Error("تعطیلات یافت نشد");

    const type = updateData.type ?? existing.type;
    let startMinute = existing.startMinute;
    let endMinute = existing.endMinute;

    if (type === "FULL_DAY") {
      startMinute = null;
      endMinute = null;
    } else if (updateData.startTime || updateData.endTime) {
      const startTime =
        updateData.startTime ??
        (existing.startMinute != null
          ? minutesToTime(existing.startMinute)
          : "09:00");
      const endTime =
        updateData.endTime ??
        (existing.endMinute != null
          ? minutesToTime(existing.endMinute)
          : "17:00");
      const mins = toHolidayMinutes({ type: "TIME_RANGE", startTime, endTime });
      startMinute = mins.startMinute;
      endMinute = mins.endMinute;
    }

    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        title: updateData.title,
        date: updateData.date ? parseBookingDate(updateData.date) : undefined,
        type: updateData.type,
        startMinute,
        endMinute,
      },
    });

    revalidatePath("/admin/schedule");
    return { success: true, data: labelHoliday(holiday) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteHoliday(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const { id } = holidayIdSchema.parse(input);
    const existing = await prisma.holiday.findUnique({ where: { id } });
    if (!existing) throw new Error("تعطیلات یافت نشد");

    await prisma.holiday.delete({ where: { id } });
    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getHolidays(
  barberId?: string
): Promise<ActionResponse<HolidayWithLabels[]>> {
  try {
    const holidays = await prisma.holiday.findMany({
      where: barberId
        ? { OR: [{ barberId }, { barberId: null }] }
        : { barberId: null },
      orderBy: { date: "asc" },
    });
    return { success: true, data: holidays.map(labelHoliday) };
  } catch (error) {
    return handleActionError(error);
  }
}
