"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/stores/booking";

const redirects: Record<number, string> = {
  2: "/book",
  3: "/book/barber",
  4: "/book/date-time",
};

/** Redirect when persisted booking state is missing prerequisites for this step. */
export function useBookingGuard(step: 2 | 3 | 4) {
  const router = useRouter();
  const hasHydrated = useBookingStore((s) => s._hasHydrated);
  const serviceIds = useBookingStore((s) => s.serviceIds);
  const barberId = useBookingStore((s) => s.barberId);
  const date = useBookingStore((s) => s.date);
  const startTime = useBookingStore((s) => s.startTime);

  useEffect(() => {
    if (!hasHydrated) return;

    const missingServices = step >= 2 && serviceIds.length === 0;
    const missingBarber = step >= 3 && !barberId;
    const missingDateTime = step >= 4 && (!date || !startTime);

    if (missingServices || missingBarber || missingDateTime) {
      router.replace(redirects[step]);
    }
  }, [hasHydrated, step, serviceIds.length, barberId, date, startTime, router]);
}
