"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { showSuccess, showError } from "@/lib/toast";
import { AuthShell } from "@/components/layout/AuthShell";
import { FormField } from "@/components/brand/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClassName =
  "min-h-11 h-11 rounded-[var(--radius-input)] border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)]";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        showError(result.error || "خطا در ثبت‌نام");
        setLoading(false);
        return;
      }

      showSuccess("ثبت‌نام موفق — در حال انتقال...");
      setSuccess(true);
      const loginUrl = callbackUrl
        ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/login";
      setTimeout(() => router.push(loginUrl), 2000);
    } catch {
      showError("خطای ارتباط با سرور");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen min-h-dvh flex-col items-center justify-center bg-[var(--color-paper)] px-[var(--space-md)]">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-[var(--space-md)] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--status-paid-bg)]">
            <CheckCircle className="h-7 w-7 text-[var(--status-paid-fg)]" />
          </div>
          <h1 className="text-[var(--text-xl)] font-semibold text-[var(--color-ink)]">
            ثبت‌نام موفق
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            در حال انتقال به صفحه ورود...
          </p>
          <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-[var(--color-accent)]" />
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      title="ثبت‌نام"
      description="حساب کاربری جدید بسازید"
      footer={
        <p className="mt-[var(--space-md)] text-center text-sm text-[var(--color-ink-muted)]">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href={
              callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/login"
            }
            className="font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            وارد شوید
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[var(--space-sm)]">
        <FormField id="name" label="نام" required error={errors.name?.message}>
          <Input
            id="name"
            placeholder="نام خود را وارد کنید"
            {...register("name")}
            className={inputClassName}
          />
        </FormField>

        <FormField
          id="phone"
          label="شماره موبایل"
          required
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            placeholder="09123456789"
            {...register("phone")}
            className={inputClassName}
            dir="ltr"
          />
        </FormField>

        <FormField
          id="password"
          label="رمز عبور"
          required
          hint="حداقل ۶ کاراکتر"
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="حداقل ۶ کاراکتر"
              {...register("password")}
              className={`${inputClassName} pe-11`}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 end-0 flex min-h-11 min-w-11 items-center justify-center text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
              aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        <FormField
          id="confirmPassword"
          label="تکرار رمز عبور"
          required
          error={errors.confirmPassword?.message}
        >
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="رمز عبور را دوباره وارد کنید"
              {...register("confirmPassword")}
              className={`${inputClassName} pe-11`}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 end-0 flex min-h-11 min-w-11 items-center justify-center text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
              aria-label={showConfirmPassword ? "مخفی کردن رمز" : "نمایش رمز"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        <Button
          type="submit"
          variant="brand"
          className="mt-[var(--space-sm)] w-full"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          ثبت‌نام
        </Button>
      </form>
    </AuthShell>
  );
}
