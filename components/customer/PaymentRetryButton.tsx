"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { initiatePayment } from "@/app/actions/payment";
import { showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";

interface PaymentRetryButtonProps {
  appointmentId: string;
  label?: string;
}

export function PaymentRetryButton({
  appointmentId,
  label = "تلاش مجدد پرداخت",
}: PaymentRetryButtonProps) {
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
      className="w-full min-h-11"
      onClick={() => void handleRetry()}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {label}
    </Button>
  );
}
