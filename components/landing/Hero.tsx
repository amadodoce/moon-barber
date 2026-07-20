import Link from "next/link";
import { Scissors } from "lucide-react";

interface HeroProps {
  shopName?: string;
  subtitle?: string;
}

export function Hero({ shopName = "مون باربر", subtitle = "رزرو آنلاین نوبت در چند ثانیه" }: HeroProps) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "var(--surface-base)" }}>
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--booking-gold)]/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_auto] md:items-center">
          {/* Text block — left-biased */}
          <div className="max-w-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--booking-gold)]/20" style={{ backgroundColor: "var(--surface-overlay)" }}>
              <Scissors className="h-7 w-7" style={{ color: "var(--booking-gold)" }} />
            </div>

            <h1 className="overflow-wrap-anywhere min-w-0 text-4xl font-bold tracking-tight md:text-6xl" style={{ color: "var(--text-primary)" }}>
              {shopName}
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </p>

            <Link
              href="/book"
              className="mt-8 inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-base font-semibold transition-colors duration-200"
              style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
            >
              رزرو نوبت
            </Link>
          </div>

          {/* Visual block — right side, asymmetric */}
          <div className="hidden md:block">
            <div className="relative h-64 w-56 rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--surface-overlay)" }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Scissors className="h-16 w-16" style={{ color: "var(--booking-gold)", opacity: 0.15 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
