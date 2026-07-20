import { z } from "zod";

export const upsertLandingContentSchema = z.object({
  key: z
    .string()
    .min(1, "کلید الزامی است")
    .max(50, "کلید نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"),
  value: z.string().min(1, "مقدار الزامی است"),
  type: z.enum(["TEXT", "RICH_TEXT", "IMAGE", "JSON"]).optional().default("TEXT"),
});

export type UpsertLandingContentInput = z.infer<typeof upsertLandingContentSchema>;

/** Predefined landing page content keys */
export const LANDING_PAGE_KEYS = [
  { key: "shop_name", label: "نام مون باربر", type: "TEXT" as const },
  { key: "hero_image", label: "تصویر هدر", type: "IMAGE" as const },
  { key: "about_text", label: "درباره ما", type: "RICH_TEXT" as const },
  { key: "phone", label: "شماره تلفن", type: "TEXT" as const },
  { key: "address", label: "آدرس", type: "TEXT" as const },
  { key: "working_hours_text", label: "ساعات کاری", type: "TEXT" as const },
  { key: "instagram", label: "اینستاگرام", type: "TEXT" as const },
  { key: "services_highlight", label: "سرویس‌های ویژه", type: "JSON" as const },
] as const;
