"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireAdminOrBarber,
  handleActionError,
  type ActionResponse,
} from "@/lib/auth-utils";
import {
  createWorkingHourSchema,
  updateWorkingHourSchema,
  workingHourIdSchema,
  type CreateWorkingHourInput,
  type UpdateWorkingHourInput,
} from "@/lib/validations/working-hour";
import type { WorkingHour } from "@/app/generated/prisma/client";
import { parseLocalDate } from "@/lib/dates";

/** Create a new working hour (ADMIN or BARBER for their own) */
export async function createWorkingHour(
  input: CreateWorkingHourInput
): Promise<ActionResponse<WorkingHour>> {
  try {
    const user = await requireAdminOrBarber();

    const data = createWorkingHourSchema.parse(input);

    // Barbers can only set their own hours
    if (user.role === "BARBER" && data.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { userId: user.userId },
      });
      if (!barber || barber.id !== data.barberId) {
        throw new Error("FORBIDDEN");
      }
    }

    // If barberId is provided, verify the barber exists
    if (data.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { id: data.barberId },
      });
      if (!barber) {
        throw new Error("آرایشگر یافت نشد");
      }
    }

    const specificDate = data.specificDate ? parseLocalDate(data.specificDate) : null;

    const workingHour = await prisma.workingHour.create({
      data: {
        barberId: data.barberId ?? null,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring ?? true,
        specificDate,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/admin/schedule");
    return { success: true, data: workingHour };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Update a working hour (ADMIN or BARBER for their own) */
export async function updateWorkingHour(
  input: UpdateWorkingHourInput
): Promise<ActionResponse<WorkingHour>> {
  try {
    const user = await requireAdminOrBarber();

    const data = updateWorkingHourSchema.parse(input);
    const { id, ...updateData } = data;

    // Check ownership
    const existing = await prisma.workingHour.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("ساعات کاری یافت نشد");
    }

    if (user.role === "BARBER" && existing.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { userId: user.userId },
      });
      if (!barber || barber.id !== existing.barberId) {
        throw new Error("FORBIDDEN");
      }
    }

    const workingHour = await prisma.workingHour.update({
      where: { id },
      data: {
        ...updateData,
        specificDate: updateData.specificDate
          ? parseLocalDate(updateData.specificDate)
          : updateData.specificDate === null
            ? null
            : undefined,
      },
    });

    revalidatePath("/admin/schedule");
    return { success: true, data: workingHour };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Delete a working hour (ADMIN or BARBER for their own) */
export async function deleteWorkingHour(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    const user = await requireAdminOrBarber();

    const { id } = workingHourIdSchema.parse(input);

    const existing = await prisma.workingHour.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("ساعات کاری یافت نشد");
    }

    if (user.role === "BARBER" && existing.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { userId: user.userId },
      });
      if (!barber || barber.id !== existing.barberId) {
        throw new Error("FORBIDDEN");
      }
    }

    await prisma.workingHour.delete({ where: { id } });

    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get working hours for a barber (or shop-wide if barberId is null) */
export async function getWorkingHours(
  barberId?: string
): Promise<ActionResponse<WorkingHour[]>> {
  try {
    const hours = await prisma.workingHour.findMany({
      where: barberId ? { barberId } : { barberId: null },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return { success: true, data: hours };
  } catch (error) {
    return handleActionError(error);
  }
}
