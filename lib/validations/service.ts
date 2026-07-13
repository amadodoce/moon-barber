import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, "نام سرویس الزامی است")
    .max(100, "نام سرویس نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  description: z.string().max(500).optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "حداقل مدت زمان ۵ دقیقه است")
    .max(480, "حداکثر مدت زمان ۴۸۰ دقیقه است"),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد").max(99999999.99),
  imageUrl: z.string().url("آدرس تصویر معتبر نیست").optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceSchema = z.object({
  id: z.string().cuid(),
  name: z
    .string()
    .min(1, "نام سرویس الزامی است")
    .max(100, "نام سرویس نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .optional(),
  description: z.string().max(500).optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "حداقل مدت زمان ۵ دقیقه است")
    .max(480, "حداکثر مدت زمان ۴۸۰ دقیقه است")
    .optional(),
  price: z
    .number()
    .min(0, "قیمت نمی‌تواند منفی باشد")
    .max(99999999.99)
    .optional(),
  imageUrl: z.string().url("آدرس تصویر معتبر نیست").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const serviceIdSchema = z.object({
  id: z.string().cuid("شناسه سرویس معتبر نیست"),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceIdInput = z.infer<typeof serviceIdSchema>;
