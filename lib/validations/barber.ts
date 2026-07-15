import { z } from "zod";

const phoneRegex = /^09\d{9}$/;

export const createBarberSchema = z.object({
  name: z
    .string()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"),
  phone: z
    .string()
    .regex(phoneRegex, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  bio: z.string().max(500).optional(),
  experienceYears: z.number().int().positive("سال تجربه باید عدد مثبت باشد").optional(),
});

export const updateBarberSchema = z.object({
  id: z.string().cuid("شناسه آرایشگر معتبر نیست"),
  name: z
    .string()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(50)
    .optional(),
  bio: z.string().max(500).optional(),
  experienceYears: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBarberInput = z.infer<typeof createBarberSchema>;
export type UpdateBarberInput = z.infer<typeof updateBarberSchema>;
