import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createWorkingHourSchema = z
  .object({
    barberId: z.string().cuid().optional(), // null = shop-wide hours
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: z
      .string()
      .regex(timeRegex, "زمان شروع معتبر نیست (HH:mm)"),
    endTime: z
      .string()
      .regex(timeRegex, "زمان پایان معتبر نیست (HH:mm)"),
    isRecurring: z.boolean().optional().default(true),
    specificDate: z.string().optional(), // ISO date string for one-off hours
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      // endTime must be after startTime
      if (data.startTime >= data.endTime) return false;
      return true;
    },
    { message: "زمان پایان باید بعد از زمان شروع باشد", path: ["endTime"] }
  )
  .refine(
    (data) => {
      // If not recurring, specificDate is required
      if (!data.isRecurring && !data.specificDate) return false;
      return true;
    },
    {
      message: "تاریخ خاص برای ساعات غیر تکراری الزامی است",
      path: ["specificDate"],
    }
  );

export const updateWorkingHourSchema = z
  .object({
    id: z.string().cuid(),
    dayOfWeek: z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .optional(),
    startTime: z
      .string()
      .regex(timeRegex, "زمان شروع معتبر نیست (HH:mm)")
      .optional(),
    endTime: z
      .string()
      .regex(timeRegex, "زمان پایان معتبر نیست (HH:mm)")
      .optional(),
    isRecurring: z.boolean().optional(),
    specificDate: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime && data.startTime >= data.endTime)
        return false;
      return true;
    },
    { message: "زمان پایان باید بعد از زمان شروع باشد", path: ["endTime"] }
  );

export const workingHourIdSchema = z.object({
  id: z.string().cuid("شناسه ساعات کاری معتبر نیست"),
});

export type CreateWorkingHourInput = z.infer<typeof createWorkingHourSchema>;
export type UpdateWorkingHourInput = z.infer<typeof updateWorkingHourSchema>;
export type WorkingHourIdInput = z.infer<typeof workingHourIdSchema>;
