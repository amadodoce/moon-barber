import { z } from "zod";

export const initiatePaymentSchema = z.object({
  appointmentId: z.string().cuid("شناسه نوبت معتبر نیست"),
});

export const paymentCallbackSchema = z.object({
  Authority: z.string().min(1, "کد اختیاری الزامی است"),
  Status: z.string(), // "OK" or "NOK"
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type PaymentCallbackInput = z.infer<typeof paymentCallbackSchema>;
