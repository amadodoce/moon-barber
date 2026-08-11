"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Loader2, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { getSafeCallbackUrl } from "@/lib/auth-redirect";
import { showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);

    const result = await signIn("credentials", {
      phone: data.phone,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      showError("شماره موبایل یا رمز عبور اشتباه است");
      setLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    router.push(getSafeCallbackUrl(callbackUrl, role));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          placeholder="••••••"
          {...register("password")}
          className="mt-1.5 h-11 rounded-xl border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]"
          dir="ltr"
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-xl text-sm font-semibold transition-colors duration-150 hover:opacity-90"
        style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
      >
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        ورود
      </Button>
    </form>
  );
}

function RegisterLink() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
      حساب ندارید؟{" "}
      <Link
        href={
          callbackUrl && callbackUrl !== "/"
            ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : "/register"
        }
        className="font-medium transition-colors duration-150 hover:opacity-80"
        style={{ color: "var(--booking-gold)" }}
      >
        ثبت‌نام کنید
      </Link>
    </p>
  );
}

export default function LoginPage() {
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
            ورود به حساب
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            شماره موبایل و رمز عبور خود را وارد کنید
          </p>

          <div className="mt-6">
            <Suspense
              fallback={
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--booking-gold)" }} />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>

        {/* Register link */}
        <Suspense fallback={null}>
          <RegisterLink />
        </Suspense>
      </div>
    </div>
  );
}
