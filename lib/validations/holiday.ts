import { z } from "zod";
import { timeToMinutes } from "@/lib/booking/time";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createHolidaySchema = z
  .object({
    barberId: z.string().cuid().optional(),
    title: z
      .string()
      .min(1, "عنوان تعطیلات الزامی است")
      .max(100, "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ معتبر نیست"),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
    type: z.enum(["FULL_DAY", "TIME_RANGE"]).optional().default("FULL_DAY"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "TIME_RANGE") {
      if (!data.startTime || !data.endTime) {
        ctx.addIssue({
          code: "custom",
          message: "زمان شروع و پایان برای بازه زمانی الزامی است",
          path: ["startTime"],
        });
        return;
      }
      if (timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)) {
        ctx.addIssue({
          code: "custom",
          message: "زمان پایان باید بعد از زمان شروع باشد",
          path: ["endTime"],
        });
      }
    }
  });

export const updateHolidaySchema = z
  .object({
    id: z.string().cuid(),
    title: z.string().min(1).max(100).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(timeRegex).optional().nullable(),
    endTime: z.string().regex(timeRegex).optional().nullable(),
    type: z.enum(["FULL_DAY", "TIME_RANGE"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === "TIME_RANGE" &&
      data.startTime &&
      data.endTime &&
      timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "زمان پایان باید بعد از زمان شروع باشد",
        path: ["endTime"],
      });
    }
  });

export const holidayIdSchema = z.object({
  id: z.string().cuid("شناسه تعطیلات معتبر نیست"),
});

export function toHolidayMinutes(input: {
  type: "FULL_DAY" | "TIME_RANGE";
  startTime?: string | null;
  endTime?: string | null;
}): { startMinute: number | null; endMinute: number | null } {
  if (input.type === "FULL_DAY") {
    return { startMinute: null, endMinute: null };
  }
  return {
    startMinute: input.startTime ? timeToMinutes(input.startTime) : null,
    endMinute: input.endTime ? timeToMinutes(input.endTime) : null,
  };
}

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
export type HolidayIdInput = z.infer<typeof holidayIdSchema>;
