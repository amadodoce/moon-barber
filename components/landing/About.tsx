import { Shield, Star, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "کیفیت تضمینی",
    description: "استفاده از بهترین محصولات و تجهیزات حرفه‌ای",
  },
  {
    icon: Star,
    title: "سابقه درخشان",
    description: "سال‌ها تجربه در ارائه خدمات آرایشگاهی",
  },
  {
    icon: Users,
    title: "تیم حرفه‌ای",
    description: "آرایشگران مجرب و دوره‌دیده",
  },
];

interface AboutProps {
  text?: string;
}

export function About({ text = "ما با سال‌ها تجربه در ارائه خدمات آرایشگاهی مردانه، تلاش می‌کنیم تا بهترین تجربه را برای شما فراهم کنیم." }: AboutProps) {
  return (
    <section className="bg-[#0c0b09] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_auto] md:items-center">
          {/* Text content — left */}
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold text-[#f5f0e8] md:text-4xl">
              تجربه‌ای متفاوت از آرایشگاه
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6a6458]">
              {text}
            </p>

            {/* Features list */}
            <div className="mt-8 space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4A853]/10">
                    <feature.icon className="h-4 w-4 text-[#D4A853]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#f5f0e8]">
                      {feature.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-[#6a6458]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual block — right side, asymmetric */}
          <div className="hidden md:block">
            <div className="relative h-72 w-60 rounded-2xl border border-[#2a2520] bg-[#1a1814] p-6">
              <div className="space-y-3">
                <div className="h-2.5 w-3/4 rounded-full bg-[#D4A853]/15" />
                <div className="h-2.5 w-1/2 rounded-full bg-[#D4A853]/8" />
                <div className="h-2.5 w-2/3 rounded-full bg-[#D4A853]/8" />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4A853]/20 bg-[#D4A853]/8">
                  <Shield className="h-4 w-4 text-[#D4A853]" />
                </div>
                <div>
                  <div className="h-2 w-16 rounded-full bg-[#D4A853]/12" />
                  <div className="mt-1.5 h-2 w-10 rounded-full bg-[#D4A853]/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
