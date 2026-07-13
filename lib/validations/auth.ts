import { z } from "zod";

// Iranian mobile phone format: 09XXXXXXXXX (11 digits)
const phoneRegex = /^09\d{9}$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "نام باید حداقل ۲ کاراکتر باشد")
      .max(50, "نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"),
    phone: z
      .string()
      .regex(phoneRegex, "شماره موبایل معتبر نیست (مثال: 09123456789)"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن مطابقت ندارند",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
