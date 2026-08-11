import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/brand/SurfaceCard";

const steps = [
  {
    number: "۱",
    title: "سرویس خود را انتخاب کنید",
    description: "از بین سرویس‌های متنوع ما، سرویس مورد نظرتان را انتخاب کنید",
  },
  {
    number: "۲",
    title: "زمان مناسب را رزرو کنید",
    description: "تقویم ما را مشاهده کرده و ساعت دلخواه خود را انتخاب کنید",
  },
  {
    number: "۳",
    title: "پرداخت آنلاین انجام دهید",
    description: "به صورت امن و آنلاین از طریق درگاه زرین‌پال پرداخت کنید",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-[var(--color-paper)] py-[var(--space-2xl)] md:py-[var(--space-3xl)]"
    >
      <div className="mx-auto max-w-6xl px-[var(--space-md)]">
        <div className="mb-[var(--space-xl)] max-w-md">
          <p className="text-[var(--text-xs)] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            فرآیند رزرو
          </p>
          <h2
            className="mt-[var(--space-2xs)] font-semibold text-[var(--color-ink)]"
            style={{ fontSize: "var(--text-display-s)" }}
          >
            چگونه کار می‌کند؟
          </h2>
          <p className="mt-[var(--space-sm)] text-[var(--text-sm)] text-[var(--color-ink-muted)]">
            سه گام تا نوبت شما
          </p>
        </div>

        <div className="max-w-2xl space-y-[var(--space-sm)]">
          {steps.map((step, index) => (
            <SurfaceCard
              key={index}
              className="transition-colors duration-[var(--dur-short)] hover:border-[color-mix(in_oklch,var(--color-accent)_25%,var(--color-rule))]"
            >
              <div className="flex items-start gap-[var(--space-md)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--color-accent)_35%,var(--color-rule))] bg-[var(--color-accent-soft)] text-[var(--text-sm)] font-bold text-[var(--color-accent)]">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-[var(--text-md)] font-semibold text-[var(--color-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-[var(--space-3xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)]">
                    {step.description}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="mt-[var(--space-xl)]">
          <Button variant="brand" render={<Link href="/book" />}>
            شروع رزرو
          </Button>
        </div>
      </div>
    </section>
  );
}
