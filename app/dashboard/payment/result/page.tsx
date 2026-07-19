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
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            پرداخت موفق
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
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
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
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
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            پرداخت ناموفق
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
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
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
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
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          خطای پرداخت
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
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
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
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
        <div className="flex min-h-screen min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <PaymentResultContent searchParams={props.searchParams} />
    </Suspense>
  );
}
