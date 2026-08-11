"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/stores/booking";

export function ResetBookingOnPaymentSuccess({ status }: { status: string }) {
  const reset = useBookingStore((s) => s.reset);

  useEffect(() => {
    if (status === "success") {
      reset();
    }
  }, [status, reset]);

  return null;
}
