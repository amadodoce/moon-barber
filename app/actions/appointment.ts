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
  createAppointmentSchema,
  appointmentIdSchema,
  updateAppointmentStatusSchema,
  getAvailableSlotsSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput,
  type GetAvailableSlotsInput,
} from "@/lib/validations/appointment";
import { getAvailableSlots, parseLocalDate, type AvailableSlot } from "@/lib/availability";
import type { Appointment } from "@/app/generated/prisma/client";

/** Get available booking slots for a barber + services + date */
export async function getAvailableBookingSlots(
  input: GetAvailableSlotsInput
): Promise<ActionResponse<AvailableSlot[]>> {
  try {
    const data = getAvailableSlotsSchema.parse(input);
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

    // Verify barber exists
    const barber = await prisma.barber.findUnique({
      where: { id: data.barberId },
    });
    if (!barber) {
      throw new Error("آرایشگر یافت نشد");
    }

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
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    // Check for overlapping appointments
    const overlapping = await prisma.appointment.findFirst({
      where: {
        barberId: data.barberId,
        date: parseLocalDate(data.date),
        status: { notIn: ["CANCELLED"] },
        deletedAt: null,
        OR: [
          {
            // New appointment starts during an existing one
            startTime: { lte: data.startTime },
            endTime: { gt: data.startTime },
          },
          {
            // New appointment ends during an existing one
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            // New appointment completely contains an existing one
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

    // Create appointment with related services in a transaction
    const appointment = await prisma.$transaction(async (tx) => {
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

      // Create AppointmentService records with price snapshots
      await tx.appointmentService.createMany({
        data: services.map((service) => ({
          appointmentId: appt.id,
          serviceId: service.id,
          priceAtBooking: service.price,
        })),
      });

      return appt;
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/appointments");
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

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/appointments");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Update appointment status (ADMIN only) */
export async function updateAppointmentStatus(
  input: UpdateAppointmentStatusInput
): Promise<ActionResponse<Appointment>> {
  try {
    await requireAdmin();

    const data = updateAppointmentStatusSchema.parse(input);

    const appointment = await prisma.appointment.findUnique({
      where: { id: data.id },
    });

    if (!appointment || appointment.deletedAt) {
      throw new Error("نوبت یافت نشد");
    }

    const updated = await prisma.appointment.update({
      where: { id: data.id },
      data: { status: data.status },
    });

    revalidatePath("/admin/appointments");
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

/** Get all appointments (ADMIN only) */
export async function getAllAppointments(): Promise<ActionResponse<Appointment[]>> {
  try {
    await requireAdmin();

    const appointments = await prisma.appointment.findMany({
      where: { deletedAt: null },
      include: {
        appointmentServices: {
          include: { service: true },
        },
        user: { select: { name: true, phone: true } },
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
