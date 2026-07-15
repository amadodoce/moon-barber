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
    <section className="bg-[#0F0F0F] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#D4A853]">
            نظرات مشتریان
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            مشتریان ما چه می‌گویند؟
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-8"
            >
              <Quote className="mb-4 h-8 w-8 text-[#D4A853]/40" />
              <p className="mb-6 text-lg leading-relaxed text-[#E5E5E5]">
                {testimonial.quote}
              </p>
              <div className="border-t border-[#2A2A2A] pt-4">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-[#D4A853]">
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
