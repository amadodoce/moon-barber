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
    <section className="bg-[var(--surface-raised)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header — left-aligned */}
        <div className="mb-12 max-w-md">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            چگونه کار می‌کند؟
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            فرآیند رزرو
          </p>
        </div>

        {/* Steps — staggered list, not centred grid */}
        <div className="max-w-2xl space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-overlay)] p-6 transition-colors duration-200 hover:border-[var(--booking-gold)]/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--booking-gold)]/30 bg-[var(--booking-gold)]/5 text-sm font-bold text-[var(--booking-gold)]">
                {step.number}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
