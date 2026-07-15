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

export function About() {
  return (
    <section className="bg-[#0F0F0F] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Text content */}
          <div>
            <p className="mb-3 text-sm font-medium tracking-widest text-[#D4A853]">
              چرا ما؟
            </p>
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              تجربه‌ای متفاوت از آرایشگاه
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-[#9A9A9A]">
              ما با سال‌ها تجربه در ارائه خدمات آرایشگاهی مردانه، تلاش می‌کنیم
              تا بهترین تجربه را برای شما فراهم کنیم. از لحظه ورود تا خروج،
              همه چیز با دقت و حرفه‌ایت برنامه‌ریزی شده است.
            </p>

            {/* Features list */}
            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4A853]/10">
                    <feature.icon className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-[#9A9A9A]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative element */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-80 w-80">
              {/* Geometric decorative pattern */}
              <div className="absolute inset-0 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A]" />
              <div className="absolute inset-4 rounded-xl border border-[#D4A853]/20" />
              <div className="absolute inset-8 rounded-lg border border-[#2A2A2A] bg-[#0F0F0F]" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10">
                  <span className="text-3xl font-bold text-[#D4A853]">✦</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
