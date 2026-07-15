"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
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
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      showError("خطای ارتباط با سرور");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ثبت‌نام موفق</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            در حال انتقال به صفحه ورود...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500">
          <Scissors className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ثبت‌نام
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          حساب کاربری جدید بسازید
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="name">نام</Label>
            <Input
              id="name"
              placeholder="نام خود را وارد کنید"
              {...register("name")}
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              placeholder="09123456789"
              {...register("phone")}
              className="mt-1"
              dir="ltr"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              placeholder="حداقل ۶ کاراکتر"
              {...register("password")}
              className="mt-1"
              dir="ltr"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="رمز عبور را دوباره وارد کنید"
              {...register("confirmPassword")}
              className="mt-1"
              dir="ltr"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            ثبت‌نام
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <a href="/login" className="font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
            وارد شوید
          </a>
        </p>
      </div>
    </div>
  );
}
