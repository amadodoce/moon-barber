"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { getServices } from "@/app/actions/service";
import { ServiceCard } from "@/components/book/ServiceCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

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
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">در حال بارگذاری سرویس‌ها...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} className="mt-8" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">انتخاب سرویس</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          سرویس‌های مورد نظر خود را انتخاب کنید
        </p>
      </div>

      {/* Service list */}
      <div className="space-y-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            id={service.id}
            name={service.name}
            description={service.description}
            durationMinutes={service.durationMinutes}
            price={Number(service.price)}
            imageUrl={service.imageUrl}
          />
        ))}
      </div>

      {/* Bottom bar */}
      {serviceIds.length > 0 && (
        <div className="sticky bottom-0 -mx-4 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 px-4 py-4">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {serviceIds.length} سرویس انتخاب شده
            </span>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 dark:text-zinc-400">
                {totalDuration} دقیقه
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {totalPrice.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            ادامه
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
