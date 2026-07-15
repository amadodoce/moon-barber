"use client";

import { Suspense, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
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

    // Fetch session to get user role
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    // Redirect based on role
    if (role === "ADMIN" || role === "BARBER") {
      router.push("/admin");
    } else {
      router.push(callbackUrl);
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
          placeholder="••••••"
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

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600"
      >
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        ورود
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500">
          <Scissors className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ورود به حساب
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          شماره موبایل و رمز عبور خود را وارد کنید
        </p>

        <Suspense
          fallback={
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          حساب ندارید؟{" "}
          <a href="/register" className="font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
            ثبت‌نام کنید
          </a>
        </p>
      </div>
    </div>
  );
}
