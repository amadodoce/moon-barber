import { Suspense } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ResetBookingOnPaymentSuccess } from "@/components/book/ResetBookingOnPaymentSuccess";

interface PaymentResultProps {
  searchParams: Promise<{ status?: string; appointmentId?: string }>;
}

async function PaymentResultContent({ searchParams }: PaymentResultProps) {
  const params = await searchParams;
  const status = params.status || "error";

  if (status === "success") {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center px-4" style={{ backgroundColor: "var(--surface-base)" }}>
        <ResetBookingOnPaymentSuccess status={status} />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, #22c55e 12%, transparent)" }}>
            <CheckCircle className="h-10 w-10" style={{ color: "#22c55e" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            پرداخت موفق
          </h1>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>
            نوبت شما با موفقیت رزرو و پرداخت شد.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/customer"
              className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
            >
              مشاهده نوبت‌ها
            </Link>
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

  if (status === "failed") {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center px-4" style={{ backgroundColor: "var(--surface-base)" }}>
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, #ef4444 12%, transparent)" }}>
            <XCircle className="h-10 w-10" style={{ color: "#ef4444" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            پرداخت ناموفق
          </h1>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>
            پرداخت شما انجام نشد. لطفاً دوباره تلاش کنید.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/book"
              className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
            >
              رزرو مجدد
            </Link>
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

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center px-4" style={{ backgroundColor: "var(--surface-base)" }}>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, #eab308 12%, transparent)" }}>
          <AlertTriangle className="h-10 w-10" style={{ color: "#eab308" }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          خطای پرداخت
        </h1>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          در پردازش پرداخت خطایی رخ داده است.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/book"
            className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
          >
            تلاش مجدد
          </Link>
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

export default function PaymentResultPage(props: PaymentResultProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen min-h-dvh items-center justify-center" style={{ backgroundColor: "var(--surface-base)" }}>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--booking-gold)", borderTopColor: "transparent" }} />
        </div>
      }
    >
      <PaymentResultContent searchParams={props.searchParams} />
    </Suspense>
  );
}
