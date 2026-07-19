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
  type CreateHolidayInput,
  type UpdateHolidayInput,
} from "@/lib/validations/holiday";
import type { Holiday } from "@/app/generated/prisma/client";
import { parseLocalDate } from "@/lib/dates";

/** Create a new holiday (ADMIN only) */
export async function createHoliday(
  input: CreateHolidayInput
): Promise<ActionResponse<Holiday>> {
  try {
    await requireAdmin();

    const data = createHolidaySchema.parse(input);

    if (data.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { id: data.barberId },
      });
      if (!barber) {
        throw new Error("آرایشگر یافت نشد");
      }
    }

    const holiday = await prisma.holiday.create({
      data: {
        barberId: data.barberId ?? null,
        title: data.title,
        date: parseLocalDate(data.date),
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
        type: data.type ?? "FULL_DAY",
      },
    });

    revalidatePath("/admin/holidays");
    return { success: true, data: holiday };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Update a holiday (ADMIN only) */
export async function updateHoliday(
  input: UpdateHolidayInput
): Promise<ActionResponse<Holiday>> {
  try {
    await requireAdmin();

    const data = updateHolidaySchema.parse(input);
    const { id, ...updateData } = data;

    const existing = await prisma.holiday.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("تعطیلات یافت نشد");
    }

    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? parseLocalDate(updateData.date) : undefined,
      },
    });

    revalidatePath("/admin/holidays");
    return { success: true, data: holiday };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Delete a holiday (ADMIN only) */
export async function deleteHoliday(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const { id } = holidayIdSchema.parse(input);

    const existing = await prisma.holiday.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("تعطیلات یافت نشد");
    }

    await prisma.holiday.delete({ where: { id } });

    revalidatePath("/admin/holidays");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get all holidays, optionally filtered by barberId */
export async function getHolidays(
  barberId?: string
): Promise<ActionResponse<Holiday[]>> {
  try {
    const holidays = await prisma.holiday.findMany({
      where: barberId
        ? { OR: [{ barberId }, { barberId: null }] }
        : { barberId: null },
      orderBy: { date: "asc" },
    });

    return { success: true, data: holidays };
  } catch (error) {
    return handleActionError(error);
  }
}
