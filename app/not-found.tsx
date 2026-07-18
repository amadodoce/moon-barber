import Link from "next/link";
import { Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500">
          <Scissors className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100">۴۰۴</h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
          صفحه مورد نظر یافت نشد
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            بازگشت به صفحه اصلی
          </Link>
          <Link
            href="/book"
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            رزرو نوبت
          </Link>
        </div>
      </div>
    </div>
  );
}
