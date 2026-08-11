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
  toWorkingHourMinutes,
  type CreateWorkingHourInput,
  type UpdateWorkingHourInput,
} from "@/lib/validations/working-hour";
import { parseBookingDate } from "@/lib/booking/timezone";
import { workingHoursWouldOverlap } from "@/lib/booking/engine";
import { withWorkingHourLabels } from "@/lib/booking/serializers";
import { minutesToTime } from "@/lib/booking/time";
import type { WorkingHour } from "@/app/generated/prisma/client";
import type { DayOfWeek } from "@/app/generated/prisma/enums";

type WorkingHourWithLabels = ReturnType<typeof withWorkingHourLabels<WorkingHour>>;

async function assertNoOverlap(
  barberId: string | null,
  dayOfWeek: DayOfWeek,
  specificDate: Date | null,
  startMinute: number,
  endMinute: number,
  excludeId?: string
) {
  const existing = await prisma.workingHour.findMany({
    where: {
      barberId,
      isActive: true,
      ...(specificDate
        ? { specificDate, isRecurring: false }
        : { dayOfWeek, isRecurring: true, specificDate: null }),
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (
    workingHoursWouldOverlap(
      existing.map((wh) => ({
        id: wh.id,
        startMinute: wh.startMinute,
        endMinute: wh.endMinute,
      })),
      { id: excludeId, startMinute, endMinute }
    )
  ) {
    throw new Error("این بازه با ساعات کاری موجود هم‌پوشانی دارد");
  }
}

export async function createWorkingHour(
  input: CreateWorkingHourInput
): Promise<ActionResponse<WorkingHourWithLabels>> {
  try {
    const user = await requireAdminOrBarber();
    const data = createWorkingHourSchema.parse(input);

    if (user.role === "BARBER") {
      if (!data.barberId) throw new Error("FORBIDDEN");
      const barber = await prisma.barber.findUnique({
        where: { userId: user.userId },
      });
      if (!barber || barber.id !== data.barberId) throw new Error("FORBIDDEN");
    } else if (data.barberId) {
      const barber = await prisma.barber.findUnique({
        where: { id: data.barberId },
      });
      if (!barber) throw new Error("آرایشگر یافت نشد");
    }

    const { startMinute, endMinute } = toWorkingHourMinutes(data);
    const specificDate = data.specificDate
      ? parseBookingDate(data.specificDate)
      : null;

    await assertNoOverlap(
      data.barberId ?? null,
      data.dayOfWeek,
      specificDate,
      startMinute,
      endMinute
    );

    const workingHour = await prisma.workingHour.create({
      data: {
        barberId: data.barberId ?? null,
        dayOfWeek: data.dayOfWeek,
        startMinute,
        endMinute,
        isRecurring: data.isRecurring ?? true,
        specificDate,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/admin/schedule");
    return { success: true, data: withWorkingHourLabels(workingHour) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateWorkingHour(
  input: UpdateWorkingHourInput
): Promise<ActionResponse<WorkingHourWithLabels>> {
  try {
    const user = await requireAdminOrBarber();
    const data = updateWorkingHourSchema.parse(input);
    const { id, ...updateData } = data;

    const existing = await prisma.workingHour.findUnique({ where: { id } });
    if (!existing) throw new Error("ساعات کاری یافت نشد");

    if (user.role === "BARBER") {
      if (!existing.barberId) throw new Error("FORBIDDEN");
      const barber = await prisma.barber.findUnique({
        where: { userId: user.userId },
      });
      if (!barber || barber.id !== existing.barberId) throw new Error("FORBIDDEN");
    }

    const finalStartTime =
      updateData.startTime ?? minutesToTime(existing.startMinute);
    const finalEndTime =
      updateData.endTime ?? minutesToTime(existing.endMinute);
    const { startMinute, endMinute } = toWorkingHourMinutes({
      startTime: finalStartTime,
      endTime: finalEndTime,
    });

    const dayOfWeek = updateData.dayOfWeek ?? existing.dayOfWeek;
    const specificDate =
      updateData.specificDate !== undefined
        ? updateData.specificDate
          ? parseBookingDate(updateData.specificDate)
          : null
        : existing.specificDate;

    await assertNoOverlap(
      existing.barberId,
      dayOfWeek,
      specificDate,
      startMinute,
      endMinute,
      id
    );

    const workingHour = await prisma.workingHour.update({
      where: { id },
      data: {
        dayOfWeek: updateData.dayOfWeek,
        startMinute,
        endMinute,
        isRecurring: updateData.isRecurring,
        specificDate:
          updateData.specificDate !== undefined ? specificDate : undefined,
        isActive: updateData.isActive,
      },
    });

    revalidatePath("/admin/schedule");
    return { success: true, data: withWorkingHourLabels(workingHour) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteWorkingHour(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    const user = await requireAdminOrBarber();
    const { id } = workingHourIdSchema.parse(input);
    const existing = await prisma.workingHour.findUnique({ where: { id } });
    if (!existing) throw new Error("ساعات کاری یافت نشد");

    if (user.role === "BARBER") {
      if (!existing.barberId) throw new Error("FORBIDDEN");
      const barber = await prisma.barber.findUnique({
        where: { userId: user.userId },
      });
      if (!barber || barber.id !== existing.barberId) throw new Error("FORBIDDEN");
    }

    await prisma.workingHour.delete({ where: { id } });
    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getWorkingHours(
  barberId?: string
): Promise<ActionResponse<WorkingHourWithLabels[]>> {
  try {
    const hours = await prisma.workingHour.findMany({
      where: barberId ? { barberId } : { barberId: null },
      orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
    });
    return {
      success: true,
      data: hours.map(withWorkingHourLabels),
    };
  } catch (error) {
    return handleActionError(error);
  }
}
