import { prisma } from "@/lib/prisma";

/** Abandoned unpaid bookings block slots for this long before auto-release. */
export const PENDING_APPOINTMENT_TTL_MS = 30 * 60 * 1000;

/**
 * Cancel stale PENDING appointments whose payment was never completed.
 * Called before slot queries and appointment creation to release inventory.
 */
export async function releaseStalePendingAppointments(): Promise<number> {
  const cutoff = new Date(Date.now() - PENDING_APPOINTMENT_TTL_MS);

  const stale = await prisma.appointment.findMany({
    where: {
      status: "PENDING",
      deletedAt: null,
      createdAt: { lt: cutoff },
      payment: { status: "PENDING" },
    },
    select: { id: true },
  });

  if (stale.length === 0) {
    return 0;
  }

  const ids = stale.map((a) => a.id);

  await prisma.$transaction([
    prisma.appointment.updateMany({
      where: { id: { in: ids } },
      data: { status: "CANCELLED" },
    }),
    prisma.payment.updateMany({
      where: { appointmentId: { in: ids }, status: "PENDING" },
      data: { status: "FAILED" },
    }),
  ]);

  return stale.length;
}

/** Whether a barber may update an appointment to the given status. */
export function canBarberUpdateAppointmentStatus(
  barberProfileId: string,
  appointmentBarberId: string,
  status: string
): boolean {
  return (
    barberProfileId === appointmentBarberId &&
    (status === "COMPLETED" || status === "NO_SHOW")
  );
}
