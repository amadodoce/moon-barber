import { z } from "zod";
import { isTodayOrFutureInTehran } from "@/lib/booking/timezone";
import { isValidTimeString, timeToMinutes } from "@/lib/booking/time";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createAppointmentSchema = z
  .object({
    barberId: z.string().cuid("شناسه آرایشگر معتبر نیست"),
    serviceIds: z
      .array(z.string().cuid())
      .min(1, "حداقل یک سرویس انتخاب کنید"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست"),
    startTime: z
      .string()
      .regex(timeRegex, "زمان شروع معتبر نیست (HH:mm)"),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => isTodayOrFutureInTehran(data.date), {
    message: "تاریخ رزرو باید امروز یا بعد از آن باشد",
    path: ["date"],
  })
  .refine((data) => isValidTimeString(data.startTime), {
    message: "زمان شروع معتبر نیست",
    path: ["startTime"],
  });

export const appointmentIdSchema = z.object({
  id: z.string().cuid("شناسه نوبت معتبر نیست"),
});

export const updateAppointmentStatusSchema = z.object({
  id: z.string().cuid("شناسه نوبت معتبر نیست"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
  ]),
});

export const getAvailableSlotsSchema = z
  .object({
    barberId: z.string().cuid("شناسه آرایشگر معتبر نیست"),
    serviceIds: z
      .array(z.string().cuid())
      .min(1, "حداقل یک سرویس انتخاب کنید"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست"),
  })
  .refine((data) => isTodayOrFutureInTehran(data.date), {
    message: "تاریخ رزرو باید امروز یا بعد از آن باشد",
    path: ["date"],
  });

export const getMonthAvailabilitySchema = z.object({
  barberId: z.string().cuid("شناسه آرایشگر معتبر نیست"),
  serviceIds: z
    .array(z.string().cuid())
    .min(1, "حداقل یک سرویس انتخاب کنید"),
  jalaliYear: z.number().int().min(1300).max(1500),
  jalaliMonth: z.number().int().min(1).max(12),
});

/** Derive startMinute from validated create input + duration */
export function deriveAppointmentMinutes(
  startTime: string,
  durationMinutes: number
): { startMinute: number; endMinute: number } {
  const startMinute = timeToMinutes(startTime);
  const endMinute = startMinute + durationMinutes;
  if (endMinute >= 24 * 60) {
    throw new Error("مدت زمان سرویس‌ها از ساعات کاری فراتر می‌رود");
  }
  return { startMinute, endMinute };
}

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentIdInput = z.infer<typeof appointmentIdSchema>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;
export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>;
export type GetMonthAvailabilityInput = z.infer<typeof getMonthAvailabilitySchema>;
