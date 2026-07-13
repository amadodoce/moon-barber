import Link from "next/link";
import { Scissors, Calendar, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500">
          <Scissors className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-900">آرایشگاه مردانه</h1>
        <p className="mt-2 text-zinc-500">
          رزرو آنلاین نوبت آرایشگاه
        </p>

        {/* Features */}
        <div className="mt-10 grid gap-4">
          <div className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-100 p-4 text-right">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <Scissors className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">انتخاب سرویس</h3>
              <p className="text-sm text-zinc-500">
                از بین سرویس‌های متنوع آرایشگاه
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-100 p-4 text-right">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <Calendar className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">انتخاب تاریخ و ساعت</h3>
              <p className="text-sm text-zinc-500">
                مشاهده ساعات خالی و انتخاب زمان مناسب
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-100 p-4 text-right">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">پرداخت آنلاین</h3>
              <p className="text-sm text-zinc-500">
                پرداخت امن از طریق درگاه زرین‌پال
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/book"
          className="mt-8 flex w-full items-center justify-center rounded-xl bg-amber-500 px-6 py-4 text-lg font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          رزرو نوبت
        </Link>
      </div>
    </div>
  );
}
