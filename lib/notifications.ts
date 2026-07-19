import { prisma } from "@/lib/prisma";
import { formatFaDate } from "@/lib/dates";

/**
 * Notification system for appointment events.
 * Currently logs notifications to console.
 * Can be extended to send emails/SMS via external providers.
 */

interface NotificationContext {
  userName: string;
  userPhone: string;
  barberName: string;
  services: string[];
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
}

async function getNotificationContext(
  appointmentId: string
): Promise<NotificationContext | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: { select: { name: true, phone: true } },
      barber: { include: { user: { select: { name: true } } } },
      appointmentServices: {
        include: { service: { select: { name: true } } },
      },
      payment: { select: { amount: true } },
    },
  });

  if (!appointment) return null;

  return {
    userName: appointment.user.name,
    userPhone: appointment.user.phone,
    barberName: appointment.barber.user.name,
    services: appointment.appointmentServices.map((as) => as.service.name),
    date: formatFaDate(appointment.date),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    totalAmount: Number(appointment.payment?.amount ?? 0),
  };
}

export async function notifyAppointmentCreated(appointmentId: string) {
  const ctx = await getNotificationContext(appointmentId);
  if (!ctx) return;

  console.log(
    `[Notification] Appointment Created:\n` +
    `  User: ${ctx.userName} (${ctx.userPhone})\n` +
    `  Barber: ${ctx.barberName}\n` +
    `  Services: ${ctx.services.join(", ")}\n` +
    `  Date: ${ctx.date} ${ctx.startTime}-${ctx.endTime}\n` +
    `  Amount: ${ctx.totalAmount.toLocaleString("fa-IR")} تومان`
  );
}

export async function notifyPaymentConfirmed(appointmentId: string) {
  const ctx = await getNotificationContext(appointmentId);
  if (!ctx) return;

  console.log(
    `[Notification] Payment Confirmed:\n` +
    `  User: ${ctx.userName} (${ctx.userPhone})\n` +
    `  Appointment: ${ctx.date} ${ctx.startTime}-${ctx.endTime}\n` +
    `  Amount: ${ctx.totalAmount.toLocaleString("fa-IR")} تومان`
  );
}

export async function notifyAppointmentCancelled(appointmentId: string) {
  const ctx = await getNotificationContext(appointmentId);
  if (!ctx) return;

  console.log(
    `[Notification] Appointment Cancelled:\n` +
    `  User: ${ctx.userName} (${ctx.userPhone})\n` +
    `  Appointment: ${ctx.date} ${ctx.startTime}-${ctx.endTime}`
  );
}
