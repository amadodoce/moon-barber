import { Suspense } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PaymentResultProps {
  searchParams: Promise<{ status?: string; appointmentId?: string }>;
}

async function PaymentResultContent({ searchParams }: PaymentResultProps) {
  const params = await searchParams;
  const status = params.status || "error";

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            پرداخت موفق
          </h1>
          <p className="mt-2 text-zinc-500">
            نوبت شما با موفقیت رزرو و پرداخت شد.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              مشاهده نوبت‌ها
            </Link>
            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            پرداخت ناموفق
          </h1>
          <p className="mt-2 text-zinc-500">
            پرداخت شما انجام نشد. لطفاً دوباره تلاش کنید.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/book"
              className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              رزرو مجدد
            </Link>
            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error status
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">
          خطای پرداخت
        </h1>
        <p className="mt-2 text-zinc-500">
          در پردازش پرداخت خطایی رخ داده است.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/book"
            className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            تلاش مجدد
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
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
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <PaymentResultContent searchParams={props.searchParams} />
    </Suspense>
  );
}
