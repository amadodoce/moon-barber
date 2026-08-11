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
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput,
  type GetAvailableSlotsInput,
} from "@/lib/validations/appointment";
import { getAvailableSlots, parseLocalDate, type AvailableSlot } from "@/lib/availability";
import { releaseStalePendingAppointments, canBarberUpdateAppointmentStatus } from "@/lib/appointment-lifecycle";
import type { Appointment } from "@/app/generated/prisma/client";
import {
  buildPaginatedResult,
  normalizeListQuery,
  type ListQueryParams,
  type PaginatedResult,
} from "@/lib/pagination";
import type { Prisma } from "@/app/generated/prisma/client";

/** Appointment with admin list relations */
export type AdminAppointment = Appointment & {
  appointmentServices: Array<{
    service: { name: string };
    priceAtBooking: unknown;
  }>;
  user: { name: string; phone: string };
  barber: { user: { name: string } };
  payment: { status: string; amount: unknown } | null;
};

/** Get available booking slots for a barber + services + date */
export async function getAvailableBookingSlots(
  input: GetAvailableSlotsInput
): Promise<ActionResponse<AvailableSlot[]>> {
  try {
    const data = getAvailableSlotsSchema.parse(input);
    await releaseStalePendingAppointments();
    const slots = await getAvailableSlots(
      data.barberId,
      data.serviceIds,
      data.date
    );
    return { success: true, data: slots };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Create a new appointment with overlap prevention */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<ActionResponse<Appointment>> {
  try {
    const user = await requireAuth();

    const data = createAppointmentSchema.parse(input);

    // Verify barber exists and is active
    const barber = await prisma.barber.findUnique({
      where: { id: data.barberId },
    });
    if (!barber) {
      throw new Error("آرایشگر یافت نشد");
    }
    if (!barber.isActive) {
      throw new Error("این آرایشگر در حال حاضر فعال نیست");
    }

    await releaseStalePendingAppointments();

    // Verify all services exist and are active
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

    // Calculate total duration and end time
    const totalDuration = services.reduce(
      (sum, s) => sum + s.durationMinutes,
      0
    );
    const startMinutes =
      parseInt(data.startTime.split(":")[0]) * 60 +
      parseInt(data.startTime.split(":")[1]);
    const endMinutes = startMinutes + totalDuration;
    if (endMinutes >= 24 * 60) {
      throw new Error("مدت زمان سرویس‌ها از ساعات کاری فراتر می‌رود");
    }
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    // Validate selected slot is currently available
    const availableSlots = await getAvailableSlots(
      data.barberId,
      data.serviceIds,
      data.date
    );
    const slotIsAvailable = availableSlots.some(
      (slot) => slot.startTime === data.startTime
    );
    if (!slotIsAvailable) {
      throw new Error("زمان انتخاب شده دیگر در دسترس نیست. لطفاً زمان دیگری انتخاب کنید");
    }

    // Calculate total amount for payment
    const totalAmount = services.reduce(
      (sum, s) => sum + Number(s.price),
      0
    );

    // Create appointment with overlap prevention inside transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.appointment.findFirst({
        where: {
          barberId: data.barberId,
          date: parseLocalDate(data.date),
          status: { notIn: ["CANCELLED"] },
          deletedAt: null,
          OR: [
            {
              startTime: { lte: data.startTime },
              endTime: { gt: data.startTime },
            },
            {
              startTime: { lt: endTime },
              endTime: { gte: endTime },
            },
            {
              startTime: { gte: data.startTime },
              endTime: { lte: endTime },
            },
          ],
        },
      });

      if (overlapping) {
        throw new Error(
          "این بازه زمانی قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید"
        );
      }

      const appt = await tx.appointment.create({
        data: {
          userId: user.userId,
          barberId: data.barberId,
          date: parseLocalDate(data.date),
          startTime: data.startTime,
          endTime,
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

    // Send notification (non-blocking)
    void notifyAppointmentCreated(appointment.id);

    return { success: true, data: appointment };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Cancel an appointment (customer can cancel their own, admin can cancel any) */
export async function cancelAppointment(
  input: { id: string }
): Promise<ActionResponse<Appointment>> {
  try {
    const user = await requireAuth();

    const { id } = appointmentIdSchema.parse(input);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.deletedAt) {
      throw new Error("نوبت یافت نشد");
    }

    // Only the owner or admin can cancel
    if (appointment.userId !== user.userId && user.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }

    // Can only cancel pending or confirmed appointments
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
        where: {
          appointmentId: id,
          status: "PENDING",
        },
        data: { status: "FAILED" },
      });

      return appt;
    });

    revalidatePath("/customer");
    revalidatePath("/admin/appointments");

    // Send notification (non-blocking)
    void notifyAppointmentCancelled(id);

    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Update appointment status (ADMIN or owning BARBER for COMPLETED/NO_SHOW) */
export async function updateAppointmentStatus(
  input: UpdateAppointmentStatusInput
): Promise<ActionResponse<Appointment>> {
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
      // Full status control for admins
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
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get current user's appointments */
export async function getMyAppointments(): Promise<ActionResponse<Appointment[]>> {
  try {
    const user = await requireAuth();

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.userId,
        deletedAt: null,
      },
      include: {
        payment: true,
        appointmentServices: {
          include: { service: true },
        },
        barber: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    return { success: true, data: appointments };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get appointments for admin with optional pagination, search, and status filter */
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
          barber: {
            include: { user: { select: { name: true } } },
          },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      success: true,
      data: buildPaginatedResult(appointments, total, page, pageSize),
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Soft-delete an appointment (ADMIN only) */
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

/** Get appointments for the logged-in barber */
export async function getBarberAppointments(): Promise<ActionResponse<Appointment[]>> {
  try {
    const user = await requireAuth();

    // Find the barber record for this user
    const barber = await prisma.barber.findUnique({
      where: { userId: user.userId },
    });

    if (!barber) {
      throw new Error("پروفایل آرایشگر یافت نشد");
    }

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
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return { success: true, data: appointments };
  } catch (error) {
    return handleActionError(error);
  }
}
