import { Quote } from "lucide-react";

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
    <section className="bg-[var(--surface-raised)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header — right-aligned for variety */}
        <div className="mb-12 text-right md:ml-auto md:max-w-md">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            مشتریان ما چه می‌گویند؟
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            نظرات مشتریان
          </p>
        </div>

        {/* Testimonials — asymmetric, no equal columns */}
        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-overlay)] p-6"
            >
              <Quote className="mb-3 h-6 w-6 text-[var(--booking-gold)]/30" />
              <p className="text-base leading-relaxed text-[var(--text-accent)]">
                {testimonial.quote}
              </p>
              <div className="mt-5 border-t border-[var(--surface-border)] pt-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{testimonial.name}</p>
                <p className="mt-0.5 text-xs text-[var(--booking-gold)]">
                  {testimonial.service}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
