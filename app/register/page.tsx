"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--booking-gold)" }} />
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
      <div className="flex min-h-screen min-h-dvh items-center justify-center px-4 py-12" style={{ backgroundColor: "var(--surface-base)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "var(--booking-gold)", opacity: 0.15 }}>
            <CheckCircle className="h-7 w-7" style={{ color: "var(--booking-gold)" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>ثبت‌نام موفق</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            در حال انتقال به صفحه ورود...
          </p>
          <div className="mt-4">
            <Loader2 className="h-5 w-5 animate-spin mx-auto" style={{ color: "var(--booking-gold)" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center px-4 py-12" style={{ backgroundColor: "var(--surface-base)" }}>
      <div className="w-full max-w-sm">
        {/* Back to home */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به صفحه اصلی
        </Link>

        {/* Card */}
        <div className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}>
          {/* Logo */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--booking-gold)" }}>
            <Scissors className="h-6 w-6" style={{ color: "var(--surface-base)" }} />
          </div>

          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            ثبت‌نام
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            حساب کاربری جدید بسازید
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-[var(--text-primary)]">
                نام
              </Label>
              <Input
                id="name"
                placeholder="نام خود را وارد کنید"
                {...register("name")}
                className="mt-1.5 h-11 rounded-xl border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-[var(--text-primary)]">
                شماره موبایل
              </Label>
              <Input
                id="phone"
                placeholder="09123456789"
                {...register("phone")}
                className="mt-1.5 h-11 rounded-xl border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]"
                dir="ltr"
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">
                رمز عبور
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="حداقل ۶ کاراکتر"
                {...register("password")}
                className="mt-1.5 h-11 rounded-xl border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]"
                dir="ltr"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-primary)]">
                تکرار رمز عبور
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="رمز عبور را دوباره وارد کنید"
                {...register("confirmPassword")}
                className="mt-1.5 h-11 rounded-xl border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]"
                dir="ltr"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl text-sm font-semibold transition-colors duration-150 hover:opacity-90"
              style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
            >
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ثبت‌نام
            </Button>
          </form>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href={
              callbackUrl
                ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/login"
            }
            className="font-medium transition-colors duration-150 hover:opacity-80"
            style={{ color: "var(--booking-gold)" }}
          >
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
