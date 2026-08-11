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
import { notifyPaymentConfirmed } from "@/lib/notifications";
import {
  initiatePaymentSchema,
  type InitiatePaymentInput,
} from "@/lib/validations/payment";
import type { Payment } from "@/app/generated/prisma/client";
import {
  buildPaginatedResult,
  normalizeListQuery,
  type ListQueryParams,
  type PaginatedResult,
} from "@/lib/pagination";
import type { Prisma } from "@/app/generated/prisma/client";
import { logPaymentEvent } from "@/lib/payment-log";
import { releaseStalePendingAppointments } from "@/lib/appointment-lifecycle";
import { withTimeLabels } from "@/lib/booking/serializers";

/** Payment with nested appointment, user, and barber relations */
export type PaymentWithRelations = Payment & {
  appointment: {
    id: string;
    date: Date;
    startMinute: number;
    endMinute: number;
    startTime: string;
    endTime: string;
    user: { name: string; phone: string };
    barber: { user: { name: string } };
    appointmentServices?: unknown;
  };
};

function labelPayment(payment: {
  appointment: { startMinute: number; endMinute: number; [key: string]: unknown };
  [key: string]: unknown;
}): PaymentWithRelations {
  return {
    ...payment,
    appointment: withTimeLabels(payment.appointment as { startMinute: number; endMinute: number }),
  } as PaymentWithRelations;
}

/** Result returned to client after initiating payment */
export interface PaymentUrlResult {
  paymentUrl: string;
  appointmentId: string;
}

export type PaymentCallbackOutcome =
  | "success"
  | "failed"
  | "cancelled"
  | "late_paid"
  | "pending_review";

export interface PaymentCallbackResult {
  outcome: PaymentCallbackOutcome;
  appointmentId: string;
}

async function findPaymentContextByAuthority(authority: string) {
  const attempt = await prisma.paymentAttempt.findUnique({
    where: { authority },
    include: {
      payment: {
        include: { appointment: true },
      },
    },
  });

  if (attempt) {
    return {
      attempt,
      payment: attempt.payment,
      appointment: attempt.payment.appointment,
    };
  }

  const payment = await prisma.payment.findFirst({
    where: { zarinpalAuthority: authority },
    include: { appointment: true },
  });

  if (!payment) return null;

  return { attempt: null, payment, appointment: payment.appointment };
}

/**
 * Initiate a Zarinpal payment for an appointment.
 * Creates a new PaymentAttempt per gateway session so retries never overwrite authority.
 */
export async function initiatePayment(
  input: InitiatePaymentInput
): Promise<ActionResponse<PaymentUrlResult>> {
  try {
    const user = await requireAuth();
    await releaseStalePendingAppointments();

    const data = initiatePaymentSchema.parse(input);

    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: {
        payment: true,
        appointmentServices: { include: { service: true } },
      },
    });

    if (!appointment || appointment.deletedAt) {
      throw new Error("نوبت یافت نشد");
    }

    if (appointment.userId !== user.userId) {
      throw new Error("FORBIDDEN");
    }

    if (appointment.status !== "PENDING") {
      throw new Error("این نوبت قابل پرداخت نیست");
    }

    if (!appointment.payment) {
      throw new Error("پرداخت برای این نوبت یافت نشد");
    }

    if (appointment.payment.status === "PAID") {
      throw new Error("این نوبت قبلاً پرداخت شده است");
    }

    if (appointment.payment.status !== "PENDING") {
      throw new Error("پرداخت برای این نوبت فعال نیست");
    }

    const totalAmount = Number(appointment.payment.amount);
    const serviceNames = appointment.appointmentServices
      .map((as) => as.service.name)
      .join(", ");
    const description = `رزرو مون باربر - ${serviceNames}`;

    const result = await requestPayment(
      totalAmount,
      description,
      user.phone,
      undefined
    );

    if (!result.success) {
      logPaymentEvent("initiate_failed", {
        appointmentId: appointment.id,
        paymentId: appointment.payment.id,
        gatewayCode: result.code,
        errorKind: result.kind,
      });
      throw new Error(
        result.errors[0] || "خطا در ارتباط با درگاه پرداخت"
      );
    }

    const amountRials = Math.round(totalAmount * 10);

    const attempt = await prisma.$transaction(async (tx) => {
      const created = await tx.paymentAttempt.create({
        data: {
          paymentId: appointment.payment!.id,
          authority: result.authority,
          amountRials,
          status: "INITIATED",
          gatewayCode: result.code ?? 100,
          gatewayMessage: result.message,
        },
      });

      await tx.payment.update({
        where: { id: appointment.payment!.id },
        data: { zarinpalAuthority: result.authority },
      });

      return created;
    });

    logPaymentEvent("initiate_success", {
      appointmentId: appointment.id,
      paymentId: appointment.payment.id,
      attemptId: attempt.id,
      authority: result.authority,
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
 * NOK cancels only the attempt; appointment stays payable until TTL expiry.
 */
export async function handlePaymentCallback(
  authority: string,
  status: string
): Promise<ActionResponse<PaymentCallbackResult>> {
  try {
    const ctx = await findPaymentContextByAuthority(authority);

    if (!ctx) {
      logPaymentEvent("callback_unknown_authority", { authority });
      throw new Error("پرداخت یافت نشد");
    }

    const { payment, appointment, attempt } = ctx;

    logPaymentEvent("callback_received", {
      appointmentId: appointment.id,
      paymentId: payment.id,
      attemptId: attempt?.id,
      authority,
      status,
    });

    if (payment.status === "PAID") {
      const outcome: PaymentCallbackOutcome = payment.needsReview
        ? "late_paid"
        : "success";
      return {
        success: true,
        data: { outcome, appointmentId: payment.appointmentId },
      };
    }

    if (status !== "OK") {
      if (attempt) {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "CANCELLED",
            gatewayMessage: "User cancelled on gateway",
            completedAt: new Date(),
          },
        });
      }

      logPaymentEvent("callback_cancelled", {
        appointmentId: appointment.id,
        paymentId: payment.id,
        attemptId: attempt?.id,
        authority,
      });

      revalidatePath("/customer");
      return {
        success: true,
        data: { outcome: "cancelled", appointmentId: payment.appointmentId },
      };
    }

    const verifyResult = await verifyPayment(Number(payment.amount), authority);

    if (attempt) {
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          gatewayCode: verifyResult.code,
          gatewayMessage: verifyResult.message ?? verifyResult.errors[0],
        },
      });
    }

    if (!verifyResult.success) {
      if (attempt) {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "FAILED",
            completedAt: new Date(),
          },
        });
      }

      logPaymentEvent("verify_failed", {
        appointmentId: appointment.id,
        paymentId: payment.id,
        attemptId: attempt?.id,
        authority,
        gatewayCode: verifyResult.code,
        errorKind: verifyResult.kind,
      });

      revalidatePath("/customer");
      return {
        success: true,
        data: { outcome: "failed", appointmentId: payment.appointmentId },
      };
    }

    const now = new Date();
    const appointmentCancelled = appointment.status === "CANCELLED";
    const appointmentPending = appointment.status === "PENDING";

    const paidUpdate = await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        status: "PAID",
        zarinpalRefId: verifyResult.refId,
        zarinpalAuthority: authority,
        paidAt: now,
        needsReview: appointmentCancelled,
        reviewNote: appointmentCancelled
          ? "پرداخت پس از لغو خودکار نوبت انجام شد — نیاز به بررسی پشتیبانی"
          : null,
      },
    });

    if (paidUpdate.count === 0) {
      const current = await prisma.payment.findUnique({
        where: { id: payment.id },
      });
      if (current?.status === "PAID") {
        const outcome: PaymentCallbackOutcome = current.needsReview
          ? "late_paid"
          : "success";
        return {
          success: true,
          data: { outcome, appointmentId: payment.appointmentId },
        };
      }
      throw new Error("وضعیت پرداخت قابل به‌روزرسانی نیست");
    }

    if (attempt) {
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "VERIFIED",
          refId: verifyResult.refId,
          gatewayCode: verifyResult.code ?? 100,
          completedAt: now,
        },
      });
    }

    if (appointmentPending) {
      await prisma.appointment.update({
        where: { id: appointment.id, status: "PENDING" },
        data: { status: "CONFIRMED" },
      });
      void notifyPaymentConfirmed(appointment.id);
    }

    logPaymentEvent("verify_success", {
      appointmentId: appointment.id,
      paymentId: payment.id,
      attemptId: attempt?.id,
      authority,
      gatewayCode: verifyResult.code,
      status: appointmentCancelled ? "late_paid" : "confirmed",
    });

    revalidatePath("/customer");
    revalidatePath("/admin/payments");

    const outcome: PaymentCallbackOutcome = appointmentCancelled
      ? "late_paid"
      : "success";

    return {
      success: true,
      data: { outcome, appointmentId: payment.appointmentId },
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

/** Get payments for admin with optional pagination, search, and status filter */
export async function getPayments(
  params: ListQueryParams = {}
): Promise<ActionResponse<PaginatedResult<PaymentWithRelations>>> {
  try {
    await requireAdmin();

    const { page, pageSize, status, search } = normalizeListQuery(params);

    const where: Prisma.PaymentWhereInput = {
      ...(status !== "all" ? { status: status as Payment["status"] } : {}),
      ...(search
        ? {
            OR: [
              {
                appointment: {
                  user: { name: { contains: search, mode: "insensitive" } },
                },
              },
              {
                appointment: { user: { phone: { contains: search } } },
              },
              { zarinpalRefId: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      success: true,
      data: buildPaginatedResult(
        payments.map(labelPayment),
        total,
        page,
        pageSize
      ),
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Get current user's payments */
export async function getMyPayments(): Promise<ActionResponse<PaymentWithRelations[]>> {
  try {
    const user = await requireAuth();

    const payments = await prisma.payment.findMany({
      where: {
        appointment: { userId: user.userId },
      },
      include: {
        appointment: {
          include: {
            user: { select: { name: true, phone: true } },
            barber: {
              include: { user: { select: { name: true } } },
            },
            appointmentServices: {
              include: { service: { select: { name: true, durationMinutes: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: payments.map(labelPayment) };
  } catch (error) {
    return handleActionError(error);
  }
}
