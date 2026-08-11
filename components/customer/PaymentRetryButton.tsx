"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { initiatePayment } from "@/app/actions/payment";
import { showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";

interface PaymentRetryButtonProps {
  appointmentId: string;
}

export function PaymentRetryButton({ appointmentId }: PaymentRetryButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    const result = await initiatePayment({ appointmentId });
    if (!result.success) {
      showError(result.error || "خطا در ایجاد پرداخت");
      setLoading(false);
      return;
    }
    window.location.href = result.data!.paymentUrl;
  };

  return (
    <Button
      variant="brand"
      className="w-full"
      onClick={() => void handleRetry()}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      تلاش مجدد پرداخت
    </Button>
  );
}
