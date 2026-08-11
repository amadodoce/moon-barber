"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Scissors } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { getServices } from "@/app/actions/service";
import { ServiceCard } from "@/components/book/ServiceCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PageHeader } from "@/components/brand/PageHeader";
import { EmptyState } from "@/components/brand/EmptyState";
import { Button } from "@/components/ui/button";
import {
  BookingBottomBar,
  BOOKING_BOTTOM_BAR_PADDING,
} from "@/components/book/BookingBottomBar";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: unknown;
  imageUrl: string | null;
}

export default function BookPage() {
  const router = useRouter();
  const { serviceIds, totalDuration, totalPrice, setStep } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  useEffect(() => {
    async function load() {
      const result = await getServices();
      if (!result.success) {
        setError(result.error || "خطا در بارگذاری سرویس‌ها");
        setLoading(false);
        return;
      }
      setServices((result.data ?? []) as Service[]);
      setLoading(false);
    }
    load();
  }, []);

  const handleNext = () => {
    router.push("/book/barber");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[var(--space-2xl)]">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">در حال بارگذاری سرویس‌ها…</p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} className="mt-[var(--space-md)]" />;
  }

  return (
    <div className={`space-y-[var(--space-md)] ${serviceIds.length > 0 ? BOOKING_BOTTOM_BAR_PADDING : ""}`}>
      <PageHeader
        eyebrow="مرحله ۱ از ۴"
        title="انتخاب سرویس"
        description="یک یا چند سرویس را برای نوبت خود انتخاب کنید."
      />

      {services.length === 0 ? (
        <EmptyState
          icon={<Scissors className="h-10 w-10" />}
          title="سرویسی موجود نیست"
          description="در حال حاضر سرویسی برای رزرو فعال نشده است."
        />
      ) : (
        <div className="space-y-[var(--space-xs)]">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description}
              durationMinutes={service.durationMinutes}
              price={Number(service.price)}
              imageUrl={service.imageUrl}
              index={i}
            />
          ))}
        </div>
      )}

      {serviceIds.length > 0 && (
        <BookingBottomBar>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-[var(--color-ink-muted)]">
              {serviceIds.length} سرویس انتخاب شده
            </span>
            <div className="flex items-center gap-[var(--space-sm)]">
              <span className="text-[var(--color-ink-muted)]">{totalDuration} دقیقه</span>
              <span className="font-bold text-[var(--color-accent)]">
                {totalPrice.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
          <Button variant="brand" className="w-full gap-2" onClick={handleNext}>
            ادامه
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </BookingBottomBar>
      )}
    </div>
  );
}
