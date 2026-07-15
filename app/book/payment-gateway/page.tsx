"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CreditCard, Loader2, X } from "lucide-react";

function MockGateway() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authority = searchParams.get("Authority");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const callbackUrl = `${origin}/api/payment/callback?Authority=${authority}`;

  const handlePay = () => {
    if (!origin) return;
    router.push(`${callbackUrl}&Status=OK`);
  };

  const handleCancel = () => {
    if (!origin) return;
    router.push(`${callbackUrl}&Status=NOK`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-800 shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4A853]">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              درگاه پرداخت
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Zarinpal Sandbox
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-700/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">وضعیت</span>
            <span className="font-medium text-[#D4A853]">
              در انتظار پرداخت
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">نوع</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              تست (Mock)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handlePay}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            پرداخت موفق
          </button>
          <button
            onClick={handleCancel}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
            لغو پرداخت
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#D4A853]" />
        </div>
      }
    >
      <MockGateway />
    </Suspense>
  );
}
