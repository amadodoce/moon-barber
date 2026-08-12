"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireAdmin,
  handleActionError,
  type ActionResponse,
} from "@/lib/auth-utils";
import {
  notifyAppointmentCreated,
  notifyAppointmentCancelled,
} from "@/lib/notifications";
import {
  createAppointmentSchema,
  appointmentIdSchema,
  updateAppointmentStatusSchema,
  getAvailableSlotsSchema,
  getMonthAvailabilitySchema,
  deriveAppointmentMinutes,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput,
  type GetAvailableSlotsInput,
  type GetMonthAvailabilityInput,
} from "@/lib/validations/appointment";
import { queryAvailableSlots, queryMonthAvailability } from "@/lib/booking/queries";
import {
  computeDaySlots,
  hasAppointmentOverlap,
  isSlotAvailable,
} from "@/lib/booking/engine";
import { parseBookingDate } from "@/lib/booking/timezone";
import { withTimeLabels } from "@/lib/booking/serializers";
import type { AvailableSlot, DayAvailability } from "@/lib/booking/types";
import {
  releaseStalePendingAppointments,
  canBarberUpdateAppointmentStatus,
} from "@/lib/appointment-lifecycle";
import type { Appointment } from "@/app/generated/prisma/client";
import {
  buildPaginatedResult,
  normalizeListQuery,
  type ListQueryParams,
  type PaginatedResult,
} from "@/lib/pagination";
import type { Prisma } from "@/app/generated/prisma/client";

type AppointmentWithLabels = Appointment & {
  startTime: string;
  endTime: string;
};

/** Appointment with admin list relations */
export type AdminAppointment = AppointmentWithLabels & {
  appointmentServices: Array<{
    service: { name: string };
    priceAtBooking: unknown;
  }>;
  user: { name: string; phone: string };
  barber: { user: { name: string } };
  payment: { status: string; amount: unknown } | null;
};

function labelAppointments<T extends { startMinute: number; endMinute: number }>(
  rows: T[]
): (T & { startTime: string; endTime: string })[] {
  return rows.map(withTimeLabels);
}

/** Get available booking slots for a barber + services + date */
export async function getAvailableBookingSlots(
  input: GetAvailableSlotsInput
): Promise<ActionResponse<AvailableSlot[]>> {
  try {
    const data = getAvailableSlotsSchema.parse(input);
    await releaseStalePendingAppointments();
    const slots = await queryAvailableSlots(
      data.barberId,
      data.serviceIds,
      data.date
    );
    return { success: true, data: slots };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get day-level availability for a Jalali month (calendar preview) */
export async function getMonthAvailability(
  input: GetMonthAvailabilityInput
): Promise<ActionResponse<DayAvailability[]>> {
  try {
    const data = getMonthAvailabilitySchema.parse(input);
    await releaseStalePendingAppointments();
    const days = await queryMonthAvailability(
      data.barberId,
      data.serviceIds,
      data.jalaliYear,
      data.jalaliMonth
    );
    return { success: true, data: days };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Create a new appointment with advisory lock + full in-transaction validation */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<ActionResponse<AppointmentWithLabels>> {
  try {
    const user = await requireAuth();
    const data = createAppointmentSchema.parse(input);

    const barber = await prisma.barber.findUnique({
      where: { id: data.barberId },
    });
    if (!barber) throw new Error("آرایشگر یافت نشد");
    if (!barber.isActive) throw new Error("این آرایشگر در حال حاضر فعال نیست");

    await releaseStalePendingAppointments();

    const services = await prisma.service.findMany({
      where: {
        id: { in: data.serviceIds },
        isActive: true,
        deletedAt: null,
      },
    });
    if (services.length !== data.serviceIds.length) {
      throw new Error("یک یا چند سرویس نامعتبر است");
    }

    const totalDuration = services.reduce(
      (sum, s) => sum + s.durationMinutes,
      0
    );
    const { startMinute, endMinute } = deriveAppointmentMinutes(
      data.startTime,
      totalDuration
    );

    const totalAmount = services.reduce((sum, s) => sum + Number(s.price), 0);
    const dateObj = parseBookingDate(data.date);
    const lockKey = `${data.barberId}:${data.date}`;

    const appointment = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      const [workingHours, holidays, existingAppts] = await Promise.all([
        tx.workingHour.findMany({
          where: {
            OR: [{ barberId: data.barberId }, { barberId: null }],
            isActive: true,
          },
        }),
        tx.holiday.findMany({
          where: {
            OR: [{ barberId: data.barberId }, { barberId: null }],
            date: dateObj,
          },
        }),
        tx.appointment.findMany({
          where: {
            barberId: data.barberId,
            date: dateObj,
            status: { notIn: ["CANCELLED"] },
            deletedAt: null,
          },
          select: { startMinute: true, endMinute: true },
        }),
      ]);

      const slots = computeDaySlots(
        workingHours.map((wh) => ({
          barberId: wh.barberId,
          dayOfWeek: wh.dayOfWeek,
          startMinute: wh.startMinute,
          endMinute: wh.endMinute,
          isRecurring: wh.isRecurring,
          specificDate: wh.specificDate,
          isActive: wh.isActive,
        })),
        holidays.map((h) => ({
          barberId: h.barberId,
          date: h.date,
          startMinute: h.startMinute,
          endMinute: h.endMinute,
          type: h.type,
        })),
        existingAppts,
        data.barberId,
        data.date,
        totalDuration
      );

      if (!isSlotAvailable(slots, startMinute)) {
        throw new Error(
          "زمان انتخاب شده دیگر در دسترس نیست. لطفاً زمان دیگری انتخاب کنید"
        );
      }

      if (hasAppointmentOverlap(existingAppts, startMinute, endMinute)) {
        throw new Error(
          "این بازه زمانی قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید"
        );
      }

      const appt = await tx.appointment.create({
        data: {
          userId: user.userId,
          barberId: data.barberId,
          date: dateObj,
          startMinute,
          endMinute,
          notes: data.notes,
          status: "PENDING",
        },
      });

      await tx.appointmentService.createMany({
        data: services.map((service) => ({
          appointmentId: appt.id,
          serviceId: service.id,
          priceAtBooking: service.price,
        })),
      });

      await tx.payment.create({
        data: {
          appointmentId: appt.id,
          amount: totalAmount,
          status: "PENDING",
          method: "ZARINPAL",
        },
      });

      return appt;
    });

    revalidatePath("/customer");
    revalidatePath("/admin/appointments");
    void notifyAppointmentCreated(appointment.id);

    return { success: true, data: withTimeLabels(appointment) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function cancelAppointment(
  input: { id: string }
): Promise<ActionResponse<AppointmentWithLabels>> {
  try {
    const user = await requireAuth();
    const { id } = appointmentIdSchema.parse(input);

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.deletedAt) {
      throw new Error("نوبت یافت نشد");
    }
    if (appointment.userId !== user.userId && user.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }
    if (
      appointment.status !== "PENDING" &&
      appointment.status !== "CONFIRMED"
    ) {
      throw new Error("این نوبت قابل لغو نیست");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      await tx.payment.updateMany({
        where: { appointmentId: id, status: "PENDING" },
        data: { status: "FAILED" },
      });
      return appt;
    });

    revalidatePath("/customer");
    revalidatePath("/admin/appointments");
    void notifyAppointmentCancelled(id);

    return { success: true, data: withTimeLabels(updated) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateAppointmentStatus(
  input: UpdateAppointmentStatusInput
): Promise<ActionResponse<AppointmentWithLabels>> {
  try {
    const user = await requireAuth();
    const data = updateAppointmentStatusSchema.parse(input);

    const appointment = await prisma.appointment.findUnique({
      where: { id: data.id },
    });
    if (!appointment || appointment.deletedAt) {
      throw new Error("نوبت یافت نشد");
    }

    if (user.role === "ADMIN") {
      // ok
    } else if (user.role === "BARBER") {
      const barber = await prisma.barber.findUnique({
        where: { userId: user.userId },
      });
      if (
        !barber ||
        !canBarberUpdateAppointmentStatus(
          barber.id,
          appointment.barberId,
          data.status
        )
      ) {
        throw new Error("FORBIDDEN");
      }
    } else {
      throw new Error("FORBIDDEN");
    }

    const updated = await prisma.appointment.update({
      where: { id: data.id },
      data: { status: data.status },
    });

    revalidatePath("/admin/appointments");
    revalidatePath("/barber");
    return { success: true, data: withTimeLabels(updated) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getMyAppointments(
  params: { page?: number; pageSize?: number } = {}
): Promise<
  ActionResponse<(AppointmentWithLabels & {
    payment: unknown;
    appointmentServices: unknown;
    barber: unknown;
  })[]>
> {
  try {
    const user = await requireAuth();
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 50));

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.userId, deletedAt: null },
      include: {
        payment: true,
        appointmentServices: { include: { service: true } },
        barber: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ date: "desc" }, { startMinute: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { success: true, data: labelAppointments(appointments) };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getAllAppointments(
  params: ListQueryParams = {}
): Promise<ActionResponse<PaginatedResult<AdminAppointment>>> {
  try {
    await requireAdmin();
    const { page, pageSize, status, search } = normalizeListQuery(params);

    const where: Prisma.AppointmentWhereInput = {
      deletedAt: null,
      ...(status !== "all" ? { status: status as Appointment["status"] } : {}),
      ...(search
        ? {
            OR: [
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { phone: { contains: search } } },
              {
                barber: {
                  user: { name: { contains: search, mode: "insensitive" } },
                },
              },
            ],
          }
        : {}),
    };

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        include: {
          appointmentServices: {
            include: { service: { select: { name: true } } },
          },
          user: { select: { name: true, phone: true } },
          barber: { include: { user: { select: { name: true } } } },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: [{ date: "desc" }, { startMinute: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      success: true,
      data: buildPaginatedResult(
        labelAppointments(appointments) as AdminAppointment[],
        total,
        page,
        pageSize
      ),
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteAppointment(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const { id } = appointmentIdSchema.parse(input);
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error("نوبت یافت نشد");
    }
    await prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getBarberAppointments(): Promise<
  ActionResponse<(AppointmentWithLabels & {
    user: { name: string; phone: string };
    appointmentServices: unknown;
  })[]>
> {
  try {
    const user = await requireAuth();
    const barber = await prisma.barber.findUnique({
      where: { userId: user.userId },
    });
    if (!barber) throw new Error("پروفایل آرایشگر یافت نشد");

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: barber.id,
        deletedAt: null,
        status: { notIn: ["CANCELLED"] },
      },
      include: {
        user: { select: { name: true, phone: true } },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
      },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    });

    return { success: true, data: labelAppointments(appointments) };
  } catch (error) {
    return handleActionError(error);
  }
}
