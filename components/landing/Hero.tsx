import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroProps {
  shopName?: string;
  subtitle?: string;
}

const marqueeItems = [
  "اصلاح حرفه‌ای",
  "رزرو آنلاین",
  "تجربه لوکس",
  "مون باربر",
];

export function Hero({
  shopName = "مون باربر",
  subtitle = "رزرو آنلاین نوبت در چند ثانیه",
}: HeroProps) {
  const marqueeText = marqueeItems.join(" · ");

  return (
    <section className="relative overflow-hidden bg-[var(--color-paper)] pt-[calc(var(--space-3xl)+3rem)]">
      {/* Marquee band */}
      <div
        className="border-y border-[var(--color-rule)] bg-[var(--color-paper-2)] py-[var(--space-2xs)]"
        aria-hidden="true"
      >
        <div className="animate-marquee flex whitespace-nowrap">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="mx-[var(--space-lg)] text-[var(--text-xs)] uppercase tracking-[0.2em] text-[var(--color-ink-muted)]"
            >
              {marqueeText}
            </span>
          ))}
        </div>
      </div>

      {/* Split studio layout */}
      <div className="mx-auto max-w-6xl px-[var(--space-md)] py-[var(--space-2xl)] md:py-[var(--space-3xl)]">
        <div className="grid items-center gap-[var(--space-xl)] md:grid-cols-[1fr_auto]">
          <div className="max-w-xl">
            <p className="mb-[var(--space-sm)] text-[var(--text-xs)] uppercase tracking-[0.14em] text-[var(--color-accent)]">
              آرایشگاه مردانه
            </p>

            <h1
              className="font-semibold leading-[1.1] tracking-tight text-[var(--color-ink)]"
              style={{ fontSize: "var(--text-display)" }}
            >
              {shopName}
            </h1>

            <p className="mt-[var(--space-md)] max-w-md text-[var(--text-lg)] leading-relaxed text-[var(--color-ink-muted)]">
              {subtitle}
            </p>

            <div className="mt-[var(--space-lg)] flex flex-wrap items-center gap-[var(--space-sm)]">
              <Button variant="brand" render={<Link href="/book" />}>
                رزرو نوبت
              </Button>
              <Button variant="outline" render={<Link href="#services" />}>
                مشاهده خدمات
              </Button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative h-[28rem] w-[18rem] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)]">
              <Image
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=800&fit=crop"
                alt={shopName}
                fill
                sizes="288px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-paper)]/70 via-transparent to-transparent" />
            </div>
            <div
              className="absolute -bottom-[var(--space-sm)] -start-[var(--space-md)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-[var(--space-md)] py-[var(--space-sm)]"
              aria-hidden="true"
            >
              <p className="text-[var(--text-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                استودیو
              </p>
              <p className="mt-[var(--space-3xs)] text-[var(--text-sm)] font-medium text-[var(--color-ink)]">
                تهران
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
