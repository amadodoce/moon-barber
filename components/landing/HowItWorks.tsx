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
    <section className="bg-[#0A0A0A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#D4A853]">
            فرآیند رزرو
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            چگونه کار می‌کند؟
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute top-12 right-[16%] left-[16%] hidden h-px bg-[#2A2A2A] md:block" />

          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Number circle */}
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4A853] bg-[#0A0A0A] text-lg font-bold text-[#D4A853]">
                {step.number}
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">
                {step.title}
              </h3>
              <p className="mx-auto max-w-xs text-[#9A9A9A]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
