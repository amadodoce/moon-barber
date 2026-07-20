import { Scissors, Clock } from "lucide-react";

interface ServiceItem {
  name: string;
  description: string | null;
  price: string;
  duration: string;
}

const defaultServices: ServiceItem[] = [
  {
    name: "اصلاح مو",
    description: "اصلاح حرفه‌ای مو با جدیدترین تکنیک‌ها",
    price: "۱۵۰,۰۰۰",
    duration: "۳۰ دقیقه",
  },
  {
    name: "اصلاح ریش",
    description: "طراحی و اصلاح ریش با دقت بالا",
    price: "۱۰۰,۰۰۰",
    duration: "۲۰ دقیقه",
  },
  {
    name: "پکیج کامل",
    description: "اصلاح مو + ریش + ماساژ صورت",
    price: "۲۵۰,۰۰۰",
    duration: "۶۰ دقیقه",
  },
];

interface ServicesProps {
  services?: ServiceItem[];
}

export function Services({ services = defaultServices }: ServicesProps) {
  return (
    <section className="bg-[var(--surface-raised)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header — left-aligned */}
        <div className="mb-12 max-w-md">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            خدمات آرایشگاه
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            سرویس‌های ما
          </p>
        </div>

        {/* Services — asymmetric grid: first item spans wider */}
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          {services.map((service, i) => (
            <div
              key={service.name}
              className={`group flex items-start gap-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-overlay)] p-6 transition-colors duration-200 hover:border-[var(--booking-gold)]/30 ${
                i === 0 ? "md:col-span-2 md:p-8" : ""
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--booking-gold)]/10">
                <Scissors className="h-5 w-5 text-[var(--booking-gold)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{service.description}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-[var(--surface-border)] pt-3">
                  <span className="font-semibold text-[var(--booking-gold)]">{service.price} تومان</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--text-faint)]">
                    <Clock className="h-3 w-3" />
                    {service.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
