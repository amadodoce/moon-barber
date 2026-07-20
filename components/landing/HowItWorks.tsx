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
    <section className="bg-[#0f0e0c] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header — left-aligned */}
        <div className="mb-12 max-w-md">
          <h2 className="text-3xl font-bold text-[#f5f0e8] md:text-4xl">
            چگونه کار می‌کند؟
          </h2>
          <p className="mt-3 text-[#6a6458]">
            فرآیند رزرو
          </p>
        </div>

        {/* Steps — staggered list, not centred grid */}
        <div className="max-w-2xl space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-5 rounded-2xl border border-[#2a2520] bg-[#1a1814] p-6 transition-colors duration-200 hover:border-[#D4A853]/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4A853]/30 bg-[#D4A853]/5 text-sm font-bold text-[#D4A853]">
                {step.number}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#f5f0e8]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-[#6a6458]">
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
