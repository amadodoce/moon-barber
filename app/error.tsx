"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center px-4" style={{ backgroundColor: "var(--surface-base)" }}>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, #ef4444 12%, transparent)" }}>
          <AlertTriangle className="h-8 w-8" style={{ color: "#ef4444" }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          خطایی رخ داده
        </h1>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          متأسفانه در پردازش درخواست شما خطایی پیش آمده است.
        </p>
        <div className="mt-8 space-y-3">
          <button
            onClick={reset}
            className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
          >
            تلاش مجدد
          </button>
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--surface-border)", color: "var(--text-secondary)" }}
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
