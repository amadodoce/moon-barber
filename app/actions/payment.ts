"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requestPayment, verifyPayment } from "@/lib/zarinpal";
import {
  requireAuth,
  requireAdmin,
  handleActionError,
  type ActionResponse,
} from "@/lib/auth-utils";
import {
  initiatePaymentSchema,
  type InitiatePaymentInput,
} from "@/lib/validations/payment";
import type { Payment } from "@/app/generated/prisma/client";

/** Result returned to client after initiating payment */
export interface PaymentUrlResult {
  paymentUrl: string;
  appointmentId: string;
}

/**
 * Initiate a Zarinpal payment for an appointment.
 *
 * Flow:
 * 1. Verify user owns the appointment
 * 2. Calculate total amount from AppointmentService records
 * 3. Request authority from Zarinpal
 * 4. Save authority to Payment record
 * 5. Return payment URL for client-side redirect
 */
export async function initiatePayment(
  input: InitiatePaymentInput
): Promise<ActionResponse<PaymentUrlResult>> {
  try {
    const user = await requireAuth();

    const data = initiatePaymentSchema.parse(input);

    // Find the appointment with its payment and services
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: {
        payment: true,
        appointmentServices: {
          include: { service: true },
        },
      },
    });

    if (!appointment || appointment.deletedAt) {
      throw new Error("نوبت یافت نشد");
    }

    // Only the appointment owner can pay
    if (appointment.userId !== user.userId) {
      throw new Error("FORBIDDEN");
    }

    // Appointment must be PENDING
    if (appointment.status !== "PENDING") {
      throw new Error("این نوبت قابل پرداخت نیست");
    }

    // Payment must exist and be PENDING (created with appointment)
    if (!appointment.payment || appointment.payment.status !== "PENDING") {
      throw new Error("پرداخت برای این نوبت فعال نیست");
    }

    // Calculate total amount from services
    const totalAmount = appointment.appointmentServices.reduce(
      (sum, as) => sum + Number(as.priceAtBooking),
      0
    );

    // Build description for Zarinpal
    const serviceNames = appointment.appointmentServices
      .map((as) => as.service.name)
      .join(", ");
    const description = `رزرو آرایشگاه - ${serviceNames}`;

    // Request payment from Zarinpal
    const result = await requestPayment(
      totalAmount,
      description,
      user.phone,
      undefined
    );

    if (!result.success) {
      throw new Error(
        result.errors[0] || "خطا در ارتباط با درگاه پرداخت"
      );
    }

    // Save authority to Payment record
    await prisma.payment.update({
      where: { id: appointment.payment.id },
      data: { zarinpalAuthority: result.authority },
    });

    return {
      success: true,
      data: {
        paymentUrl: result.url,
        appointmentId: appointment.id,
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Handle the payment callback from Zarinpal.
 *
 * Called by the API route when Zarinpal redirects back.
 * Verifies the payment and updates statuses accordingly.
 *
 * @param authority - Authority code from callback
 * @param status - "OK" for success, anything else for failure
 */
export async function handlePaymentCallback(
  authority: string,
  status: string
): Promise<ActionResponse<{ success: boolean; appointmentId: string }>> {
  try {
    // Find payment by authority code
    const payment = await prisma.payment.findFirst({
      where: { zarinpalAuthority: authority },
      include: { appointment: true },
    });

    if (!payment) {
      throw new Error("پرداخت یافت نشد");
    }

    // Idempotent: if already processed, return current status
    if (payment.status === "PAID") {
      return {
        success: true,
        data: { success: true, appointmentId: payment.appointmentId },
      };
    }

    if (payment.status === "FAILED" || payment.status === "REFUNDED") {
      return {
        success: true,
        data: { success: false, appointmentId: payment.appointmentId },
      };
    }

    // User cancelled or failed on gateway
    if (status !== "OK") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        }),
        prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: "CANCELLED" },
        }),
      ]);

      revalidatePath("/dashboard");
      return {
        success: true,
        data: { success: false, appointmentId: payment.appointmentId },
      };
    }

    // Verify payment with Zarinpal
    const verifyResult = await verifyPayment(
      Number(payment.amount),
      authority
    );

    if (verifyResult.success) {
      // Payment verified — update both records in a transaction
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            zarinpalRefId: verifyResult.refId,
            paidAt: new Date(),
          },
        }),
        prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: "CONFIRMED" },
        }),
      ]);

      revalidatePath("/dashboard");
      return {
        success: true,
        data: { success: true, appointmentId: payment.appointmentId },
      };
    }

    // Verification failed
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      }),
      prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: "CANCELLED" },
      }),
    ]);

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { success: false, appointmentId: payment.appointmentId },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get payment details for an appointment (owner or admin) */
export async function getPayment(
  appointmentId: string
): Promise<ActionResponse<Payment>> {
  try {
    const user = await requireAuth();

    const payment = await prisma.payment.findUnique({
      where: { appointmentId },
    });

    if (!payment) {
      throw new Error("پرداخت یافت نشد");
    }

    // Check ownership or admin
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { userId: true },
    });

    if (
      appointment?.userId !== user.userId &&
      user.role !== "ADMIN"
    ) {
      throw new Error("FORBIDDEN");
    }

    return { success: true, data: payment };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get all payments with appointment info (ADMIN only) */
export async function getPayments(): Promise<ActionResponse<any[]>> {
  try {
    await requireAdmin();

    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            user: { select: { name: true, phone: true } },
            barber: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: payments };
  } catch (error) {
    return handleActionError(error);
  }
}
