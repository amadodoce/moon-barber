import Link from "next/link";
import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/brand/SurfaceCard";

const testimonials = [
  {
    quote: " بهترین آرایشگاهی بوده که تا حالا رفتم. کیفیت کار عالی و برخورد کارکنان بسیار محترمانه است.",
    name: "امیر حسینی",
    service: "پکیج کامل",
  },
  {
    quote: "رزرو آنلاین خیلی راحت بود. دیگه نیازی نیست زنگ بزنم یا منتظر بشینم. عالیه!",
    name: "رضا کریمی",
    service: "اصلاح مو",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[var(--color-paper-2)] py-[var(--space-2xl)] md:py-[var(--space-3xl)]">
      <div className="mx-auto max-w-6xl px-[var(--space-md)]">
        <div className="mb-[var(--space-xl)] md:ms-auto md:max-w-md md:text-end">
          <p className="text-[var(--text-xs)] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            نظرات مشتریان
          </p>
          <h2
            className="mt-[var(--space-2xs)] font-semibold text-[var(--color-ink)]"
            style={{ fontSize: "var(--text-display-s)" }}
          >
            مشتریان ما چه می‌گویند؟
          </h2>
          <p className="mt-[var(--space-sm)] text-[var(--text-sm)] text-[var(--color-ink-muted)]">
            تجربه واقعی مراجعین
          </p>
        </div>

        <div className="grid gap-[var(--space-sm)] md:grid-cols-[1fr_1.2fr]">
          {testimonials.map((testimonial) => (
            <SurfaceCard key={testimonial.name}>
              <Quote
                className="mb-[var(--space-sm)] h-6 w-6 text-[var(--color-accent)]/30"
                aria-hidden="true"
              />
              <p className="text-[var(--text-md)] leading-relaxed text-[var(--color-ink-2)]">
                {testimonial.quote}
              </p>
              <div className="mt-[var(--space-md)] border-t border-[var(--color-rule)] pt-[var(--space-sm)]">
                <p className="text-[var(--text-sm)] font-semibold text-[var(--color-ink)]">
                  {testimonial.name}
                </p>
                <p className="mt-[var(--space-3xs)] text-[var(--text-xs)] text-[var(--color-accent)]">
                  {testimonial.service}
                </p>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="mt-[var(--space-xl)] md:text-end">
          <Button variant="brand" render={<Link href="/book" />}>
            رزرو نوبت
          </Button>
        </div>
      </div>
    </section>
  );
}
