import Link from "next/link";
import { Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center px-4" style={{ backgroundColor: "var(--surface-base)" }}>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--booking-gold)" }}>
          <Scissors className="h-8 w-8" style={{ color: "var(--surface-base)" }} />
        </div>
        <h1 className="text-6xl font-bold" style={{ color: "var(--text-primary)" }}>۴۰۴</h1>
        <p className="mt-4 text-lg" style={{ color: "var(--text-muted)" }}>
          صفحه مورد نظر یافت نشد
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
          >
            بازگشت به صفحه اصلی
          </Link>
          <Link
            href="/book"
            className="flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--surface-border)", color: "var(--text-secondary)" }}
          >
            رزرو نوبت
          </Link>
        </div>
      </div>
    </div>
  );
}
