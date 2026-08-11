"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { getSafeCallbackUrl } from "@/lib/auth-redirect";
import { showError } from "@/lib/toast";
import { AuthShell } from "@/components/layout/AuthShell";
import { FormField } from "@/components/brand/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClassName =
  "min-h-11 h-11 rounded-[var(--radius-input)] border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)]";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-[var(--space-md)]">
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
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          placeholder="••••••"
          {...register("password")}
          className={inputClassName}
          dir="ltr"
        />
      </FormField>

      <Button type="submit" variant="brand" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        ورود
      </Button>
    </form>
  );
}

function RegisterLink() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <p className="mt-[var(--space-md)] text-center text-sm text-[var(--color-ink-muted)]">
      حساب ندارید؟{" "}
      <Link
        href={
          callbackUrl && callbackUrl !== "/"
            ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : "/register"
        }
        className="font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
      >
        ثبت‌نام کنید
      </Link>
    </p>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="ورود به حساب"
      description="شماره موبایل و رمز عبور خود را وارد کنید"
      footer={
        <Suspense fallback={null}>
          <RegisterLink />
        </Suspense>
      }
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-[var(--space-xl)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
