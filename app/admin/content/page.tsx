"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { getLandingContent, upsertLandingContent } from "@/app/actions/landing-page";
import { showSuccess, showError } from "@/lib/toast";
import {
  upsertLandingContentSchema,
  LANDING_PAGE_KEYS,
} from "@/lib/validations/landing-page";
import type { z } from "zod";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LandingPageContent } from "@/app/generated/prisma/client";
import {
  PageHeader,
  SkeletonCard,
  SurfaceCard,
} from "@/components/brand";

type ContentFormInput = z.input<typeof upsertLandingContentSchema>;

export default function ContentPage() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentFormInput>({
    resolver: zodResolver(upsertLandingContentSchema),
  });

  useEffect(() => {
    async function load() {
      const result = await getLandingContent();
      if (!result.success) {
        setError(result.error || "خطا در بارگذاری");
        setLoading(false);
        return;
      }
      const map: Record<string, string> = {};
      (result.data ?? []).forEach((c: LandingPageContent) => {
        map[c.key] = c.value;
      });
      setContents(map);
      setLoading(false);
    }
    void load();
  }, []);

  const onSubmit = async (data: ContentFormInput) => {
    setSaving(true);

    const result = await upsertLandingContent({
      key: data.key,
      value: data.value,
      type: data.type ?? "TEXT",
    });
    if (!result.success) {
      showError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

    setContents((prev) => ({ ...prev, [data.key]: data.value }));
    showSuccess("ذخیره شد");
    setSavedKey(data.key);
    setTimeout(() => setSavedKey(null), 2000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-[var(--space-md)]">
        <PageHeader title="محتوای صفحه اصلی" eyebrow="محتوا" />
        <div className="grid grid-cols-1 gap-[var(--space-md)] lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader
        title="محتوای صفحه اصلی"
        description="ویرایش متن‌ها و تصاویر صفحه فرود"
        eyebrow="محتوا"
      />

      {error ? <ErrorMessage message={error} /> : null}

      <div className="grid grid-cols-1 gap-[var(--space-md)] lg:grid-cols-2">
        {LANDING_PAGE_KEYS.map((field) => (
          <SurfaceCard key={field.key}>
            <p className="mb-3 text-sm font-medium text-[var(--color-ink-muted)]">
              {field.label}
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <input type="hidden" {...register("key")} value={field.key} />
              <input type="hidden" {...register("type")} value={field.type} />

              {field.type === "IMAGE" ? (
                <Input
                  {...register("value", { value: contents[field.key] || "" })}
                  placeholder="آدرس تصویر"
                />
              ) : field.type === "RICH_TEXT" || field.type === "JSON" ? (
                <Textarea
                  {...register("value", { value: contents[field.key] || "" })}
                  placeholder={field.label}
                  rows={4}
                />
              ) : (
                <Input
                  {...register("value", { value: contents[field.key] || "" })}
                  placeholder={field.label}
                />
              )}

              {errors.value ? (
                <p className="text-xs text-[var(--status-failed-fg)]">
                  {errors.value.message}
                </p>
              ) : null}

              <Button
                type="submit"
                size="sm"
                disabled={saving}
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-ink)",
                }}
              >
                {saving ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : savedKey === field.key ? (
                  <span className="ml-2 text-[var(--status-confirmed-fg)]">
                    ذخیره شد ✓
                  </span>
                ) : (
                  <Save className="ml-2 h-4 w-4" />
                )}
                ذخیره
              </Button>
            </form>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
