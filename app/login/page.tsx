"use client";

import { useState, useEffect } from "react";
import { Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || "/");
    if (params.get("error")) {
      setError("شماره موبایل یا رمز عبور اشتباه است");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500">
          <Scissors className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-center text-2xl font-bold text-zinc-900">
          ورود به حساب
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          شماره موبایل و رمز عبور خود را وارد کنید
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          method="post"
          action="/api/auth/callback/credentials"
          className="mt-8 space-y-4"
        >
          <input type="hidden" name="csrfToken" value="" />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

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
              placeholder="••••••"
              className="mt-1"
              dir="ltr"
              required
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-base font-semibold text-white hover:bg-amber-600 active:bg-amber-700"
            style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", minHeight: "48px" }}
          >
            ورود
          </button>
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
