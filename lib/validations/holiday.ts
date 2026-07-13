import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createHolidaySchema = z
  .object({
    barberId: z.string().cuid().optional(), // null = shop-wide holiday
    title: z
      .string()
      .min(1, "عنوان تعطیلات الزامی است")
      .max(100, "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
    date: z.string().min(1, "تاریخ تعطیلات الزامی است"), // ISO date string
    startTime: z
      .string()
      .regex(timeRegex, "زمان شروع معتبر نیست (HH:mm)")
      .optional(),
    endTime: z
      .string()
      .regex(timeRegex, "زمان پایان معتبر نیست (HH:mm)")
      .optional(),
    type: z.enum(["FULL_DAY", "TIME_RANGE"]).optional().default("FULL_DAY"),
  })
  .refine(
    (data) => {
      // If TIME_RANGE, startTime and endTime are required
      if (data.type === "TIME_RANGE") {
        return !!data.startTime && !!data.endTime;
      }
      return true;
    },
    {
      message: "زمان شروع و پایان برای بازه زمانی الزامی است",
      path: ["startTime"],
    }
  )
  .refine(
    (data) => {
      // If TIME_RANGE, endTime must be after startTime
      if (
        data.type === "TIME_RANGE" &&
        data.startTime &&
        data.endTime &&
        data.startTime >= data.endTime
      ) {
        return false;
      }
      return true;
    },
    { message: "زمان پایان باید بعد از زمان شروع باشد", path: ["endTime"] }
  );

export const updateHolidaySchema = z
  .object({
    id: z.string().cuid(),
    title: z
      .string()
      .min(1, "عنوان تعطیلات الزامی است")
      .max(100, "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
      .optional(),
    date: z.string().optional(), // ISO date string
    startTime: z
      .string()
      .regex(timeRegex, "زمان شروع معتبر نیست (HH:mm)")
      .optional()
      .nullable(),
    endTime: z
      .string()
      .regex(timeRegex, "زمان پایان معتبر نیست (HH:mm)")
      .optional()
      .nullable(),
    type: z.enum(["FULL_DAY", "TIME_RANGE"]).optional(),
  })
  .refine(
    (data) => {
      if (
        data.type === "TIME_RANGE" &&
        data.startTime &&
        data.endTime &&
        data.startTime >= data.endTime
      ) {
        return false;
      }
      return true;
    },
    { message: "زمان پایان باید بعد از زمان شروع باشد", path: ["endTime"] }
  );

export const holidayIdSchema = z.object({
  id: z.string().cuid("شناسه تعطیلات معتبر نیست"),
});

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
export type HolidayIdInput = z.infer<typeof holidayIdSchema>;
