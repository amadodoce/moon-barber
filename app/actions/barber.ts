"use server";

import { prisma } from "@/lib/prisma";
import { handleActionError, type ActionResponse } from "@/lib/auth-utils";

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

/** Get all active barbers with user info (public) */
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
