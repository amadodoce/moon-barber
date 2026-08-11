import Link from "next/link";
import { Scissors, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/brand/SurfaceCard";

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
    <section
      id="services"
      className="scroll-mt-24 bg-[var(--color-paper-2)] py-[var(--space-2xl)] md:py-[var(--space-3xl)]"
    >
      <div className="mx-auto max-w-6xl px-[var(--space-md)]">
        <div className="mb-[var(--space-xl)] max-w-md">
          <p className="text-[var(--text-xs)] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            منوی خدمات
          </p>
          <h2
            className="mt-[var(--space-2xs)] font-semibold text-[var(--color-ink)]"
            style={{ fontSize: "var(--text-display-s)" }}
          >
            خدمات مون باربر
          </h2>
          <p className="mt-[var(--space-sm)] text-[var(--text-sm)] text-[var(--color-ink-muted)]">
            سرویس‌های ما
          </p>
        </div>

        <div className="grid gap-[var(--space-sm)] md:grid-cols-[1.4fr_1fr]">
          {services.map((service, i) => (
            <SurfaceCard
              key={service.name}
              padding={i === 0 ? "lg" : "md"}
              className={`group transition-colors duration-[var(--dur-short)] hover:border-[color-mix(in_oklch,var(--color-accent)_30%,var(--color-rule))] ${
                i === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start gap-[var(--space-md)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-accent-soft)]">
                  <Scissors
                    className="h-5 w-5 text-[var(--color-accent)]"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[var(--text-lg)] font-semibold text-[var(--color-ink)]">
                    {service.name}
                  </h3>
                  <p className="mt-[var(--space-3xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)]">
                    {service.description}
                  </p>
                  <div className="mt-[var(--space-md)] flex flex-wrap items-center gap-[var(--space-md)] border-t border-[var(--color-rule)] pt-[var(--space-sm)]">
                    <span className="font-semibold text-[var(--color-accent)]">
                      {service.price} تومان
                    </span>
                    <span className="flex items-center gap-[var(--space-3xs)] text-[var(--text-xs)] text-[var(--color-ink-faint)]">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {service.duration}
                    </span>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="mt-[var(--space-xl)]">
          <Button variant="brand" render={<Link href="/book" />}>
            رزرو نوبت
          </Button>
        </div>
      </div>
    </section>
  );
}
