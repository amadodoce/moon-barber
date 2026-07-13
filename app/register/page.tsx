"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, confirmPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "خطا در ثبت‌نام");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("خطای ارتباط با سرور");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">ثبت‌نام موفق</h1>
          <p className="mt-2 text-sm text-zinc-500">
            در حال انتقال به صفحه ورود...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500">
          <Scissors className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-center text-2xl font-bold text-zinc-900">
          ثبت‌نام
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          حساب کاربری جدید بسازید
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="name">نام</Label>
            <Input
              id="name"
              name="name"
              placeholder="نام خود را وارد کنید"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="09123456789"
              className="mt-1"
              dir="ltr"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="حداقل ۶ کاراکتر"
              className="mt-1"
              dir="ltr"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="رمز عبور را دوباره وارد کنید"
              className="mt-1"
              dir="ltr"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-base font-semibold text-white hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50"
            style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", minHeight: "48px" }}
          >
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <a href="/login" className="font-medium text-amber-600 hover:text-amber-700">
            وارد شوید
          </a>
        </p>
      </div>
    </div>
  );
}
