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

type ContentFormInput = z.input<typeof upsertLandingContentSchema>;
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContentPage() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
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
      (result.data ?? []).forEach((c: any) => {
        map[c.key] = c.value;
      });
      setContents(map);
      setLoading(false);
    }
    load();
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
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">محتوای صفحه اصلی</h1>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {LANDING_PAGE_KEYS.map((field) => (
          <Card key={field.key} className="dark:bg-zinc-800 dark:border-zinc-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {field.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3"
              >
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

                {errors.value && (
                  <p className="text-xs text-red-500 dark:text-red-400">{errors.value.message}</p>
                )}

                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {saving ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : savedKey === field.key ? (
                    <span className="ml-2 text-green-600 dark:text-green-400">ذخیره شد ✓</span>
                  ) : (
                    <Save className="ml-2 h-4 w-4" />
                  )}
                  ذخیره
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
