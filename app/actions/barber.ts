"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  handleActionError,
  type ActionResponse,
} from "@/lib/auth-utils";
import {
  createBarberSchema,
  updateBarberSchema,
  type CreateBarberInput,
  type UpdateBarberInput,
} from "@/lib/validations/barber";
import type { Barber } from "@/app/generated/prisma/client";

export interface BarberWithUser {
  id: string;
  bio: string | null;
  experienceYears: number | null;
  isActive: boolean;
  user: {
    name: string;
    avatar: string | null;
  };
}

/** Get all active barbers with user info (public — booking flow) */
export async function getBarbers(): Promise<ActionResponse<BarberWithUser[]>> {
  try {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    return { success: true, data: barbers };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get all barbers including inactive (ADMIN only) */
export async function getAllBarbers(): Promise<ActionResponse<any[]>> {
  try {
    await requireAdmin();

    const barbers = await prisma.barber.findMany({
      include: {
        user: {
          select: { name: true, phone: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: barbers };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Create a new barber — creates User with role=BARBER + Barber record */
export async function createBarber(
  input: CreateBarberInput
): Promise<ActionResponse<Barber>> {
  try {
    await requireAdmin();

    const data = createBarberSchema.parse(input);

    // Check if phone is already registered
    const existingUser = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (existingUser) {
      throw new Error("این شماره موبایل قبلاً ثبت شده است");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create User + Barber in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          password: hashedPassword,
          role: "BARBER",
        },
      });

      const barber = await tx.barber.create({
        data: {
          userId: user.id,
          bio: data.bio || null,
          experienceYears: data.experienceYears || null,
        },
      });

      return barber;
    });

    revalidatePath("/admin/barbers");
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Update barber profile (ADMIN only) */
export async function updateBarber(
  input: UpdateBarberInput
): Promise<ActionResponse<Barber>> {
  try {
    await requireAdmin();

    const data = updateBarberSchema.parse(input);
    const { id, ...updateData } = data;

    // Check barber exists
    const existing = await prisma.barber.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("آرایشگر یافت نشد");
    }

    // Update barber record
    const barber = await prisma.barber.update({
      where: { id },
      data: {
        bio: updateData.bio,
        experienceYears: updateData.experienceYears,
        isActive: updateData.isActive,
      },
    });

    // If name changed, also update the linked user
    if (updateData.name) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { name: updateData.name },
      });
    }

    revalidatePath("/admin/barbers");
    return { success: true, data: barber };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Deactivate a barber (ADMIN only) */
export async function deleteBarber(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const { id } = input;

    const existing = await prisma.barber.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("آرایشگر یافت نشد");
    }

    // Check for active appointments
    const activeAppointments = await prisma.appointment.findFirst({
      where: {
        barberId: id,
        status: { in: ["PENDING", "CONFIRMED"] },
        deletedAt: null,
      },
    });

    if (activeAppointments) {
      throw new Error(
        "این آرایشگر دارای نوبت‌های فعال است و قابل غیرفعال کردن نیست"
      );
    }

    // Deactivate barber
    await prisma.barber.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/admin/barbers");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Activate a barber (ADMIN only) */
export async function activateBarber(
  input: { id: string }
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const { id } = input;

    const existing = await prisma.barber.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("آرایشگر یافت نشد");
    }

    await prisma.barber.update({
      where: { id },
      data: { isActive: true },
    });

    revalidatePath("/admin/barbers");
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
