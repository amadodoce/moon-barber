"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || "/");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      phone: data.phone,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("شماره موبایل یا رمز عبور اشتباه است");
      setLoading(false);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push(callbackUrl);
    }
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500">
          <Scissors className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-center text-2xl font-bold text-zinc-900">
          ورود به حساب
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          شماره موبایل و رمز عبور خود را وارد کنید
        </p>

        <form action="#" onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
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
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            ورود
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          حساب ندارید؟{" "}
          <a href="/register" className="font-medium text-amber-600 hover:text-amber-700">
            ثبت‌نام کنید
          </a>
        </p>
      </div>
    </div>
  );
}
