import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createAppointmentSchema = z
  .object({
    barberId: z.string().cuid("شناسه آرایشگر معتبر نیست"),
    serviceIds: z
      .array(z.string().cuid())
      .min(1, "حداقل یک سرویس انتخاب کنید"),
    date: z.string().min(1, "تاریخ رزرو الزامی است"), // ISO date string
    startTime: z
      .string()
      .regex(timeRegex, "زمان شروع معتبر نیست (HH:mm)"),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // Date must be today or in the future
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: "تاریخ رزرو باید امروز یا بعد از آن باشد", path: ["date"] }
  );

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

export const getAvailableSlotsSchema = z.object({
  barberId: z.string().cuid("شناسه آرایشگر معتبر نیست"),
  serviceIds: z
    .array(z.string().cuid())
    .min(1, "حداقل یک سرویس انتخاب کنید"),
  date: z.string().min(1, "تاریخ الزامی است"), // ISO date string
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentIdInput = z.infer<typeof appointmentIdSchema>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;
export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>;
