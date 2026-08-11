import { z } from "zod";
import { timeToMinutes, isValidTimeString } from "@/lib/booking/time";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

function timeToMinuteField(val: string, ctx: z.RefinementCtx, path: string) {
  if (!isValidTimeString(val)) {
    ctx.addIssue({ code: "custom", message: "زمان معتبر نیست (HH:mm)", path: [path] });
    return null;
  }
  return timeToMinutes(val);
}

export const createWorkingHourSchema = z
  .object({
    barberId: z.string().cuid().optional(),
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: z.string().regex(timeRegex, "زمان شروع معتبر نیست (HH:mm)"),
    endTime: z.string().regex(timeRegex, "زمان پایان معتبر نیست (HH:mm)"),
    isRecurring: z.boolean().optional().default(true),
    specificDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    const start = timeToMinuteField(data.startTime, ctx, "startTime");
    const end = timeToMinuteField(data.endTime, ctx, "endTime");
    if (start != null && end != null && end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "زمان پایان باید بعد از زمان شروع باشد",
        path: ["endTime"],
      });
    }
    if (!data.isRecurring && !data.specificDate) {
      ctx.addIssue({
        code: "custom",
        message: "تاریخ خاص برای ساعات غیر تکراری الزامی است",
        path: ["specificDate"],
      });
    }
  });

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
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
    isRecurring: z.boolean().optional(),
    specificDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime) {
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      if (end <= start) {
        ctx.addIssue({
          code: "custom",
          message: "زمان پایان باید بعد از زمان شروع باشد",
          path: ["endTime"],
        });
      }
    }
  });

export const workingHourIdSchema = z.object({
  id: z.string().cuid("شناسه ساعات کاری معتبر نیست"),
});

export function toWorkingHourMinutes(input: {
  startTime: string;
  endTime: string;
}): { startMinute: number; endMinute: number } {
  return {
    startMinute: timeToMinutes(input.startTime),
    endMinute: timeToMinutes(input.endTime),
  };
}

export type CreateWorkingHourInput = z.infer<typeof createWorkingHourSchema>;
export type UpdateWorkingHourInput = z.infer<typeof updateWorkingHourSchema>;
export type WorkingHourIdInput = z.infer<typeof workingHourIdSchema>;
