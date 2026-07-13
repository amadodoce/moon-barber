"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  handleActionError,
  type ActionResponse,
} from "@/lib/auth-utils";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "@/lib/validations/service";
import type { Service } from "@/app/generated/prisma/client";

/** Create a new service (ADMIN only) */
export async function createService(
  input: CreateServiceInput
): Promise<ActionResponse<Service>> {
  try {
    await requireAdmin();

    const data = createServiceSchema.parse(input);

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        durationMinutes: data.durationMinutes,
        price: data.price,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/admin/services");
    return { success: true, data: service };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Update an existing service (ADMIN only) */
export async function updateService(
  input: UpdateServiceInput
): Promise<ActionResponse<Service>> {
  try {
    await requireAdmin();

    const data = updateServiceSchema.parse(input);
    const { id, ...updateData } = data;

    // Check service exists
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error("سرویس یافت نشد");
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/services");
    return { success: true, data: service };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Soft-delete a service (ADMIN only) */
export async function deleteService(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const { id } = serviceIdSchema.parse(input);

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error("سرویس یافت نشد");
    }

    // Soft delete — don't remove if there are active appointments
    const activeAppointments = await prisma.appointmentService.findFirst({
      where: {
        serviceId: id,
        appointment: {
          status: { in: ["PENDING", "CONFIRMED"] },
          deletedAt: null,
        },
      },
    });

    if (activeAppointments) {
      throw new Error(
        "این سرویس دارای نوبت‌های فعال است و قابل حذف نیست"
      );
    }

    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get all active services (public) */
export async function getServices(): Promise<ActionResponse<Service[]>> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
    });

    return { success: true, data: services };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get all services including inactive (ADMIN only) */
export async function getAllServices(): Promise<ActionResponse<Service[]>> {
  try {
    await requireAdmin();

    const services = await prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: services };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get a single service by ID */
export async function getService(
  input: { id: string }
): Promise<ActionResponse<Service>> {
  try {
    const { id } = serviceIdSchema.parse(input);

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service || service.deletedAt) {
      throw new Error("سرویس یافت نشد");
    }

    return { success: true, data: service };
  } catch (error) {
    return handleActionError(error);
  }
}
