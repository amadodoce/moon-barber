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
    description: "سال‌ها تجربه در ارائه خدمات باربرین",
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

export function About({ text = "ما با سال‌ها تجربه در ارائه خدمات باربرین، تلاش می‌کنیم تا بهترین تجربه را برای شما فراهم کنیم." }: AboutProps) {
  return (
    <section className="bg-[var(--surface-base)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_auto] md:items-center">
          {/* Text content — left */}
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
              تجربه‌ای متفاوت از مون باربر
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
              {text}
            </p>

            {/* Features list */}
            <div className="mt-8 space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--booking-gold)]/10">
                    <feature.icon className="h-4 w-4 text-[var(--booking-gold)]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                      {feature.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual block — right side, asymmetric */}
          <div className="hidden md:block">
            <div className="relative h-72 w-60 overflow-hidden rounded-2xl" style={{ backgroundColor: "var(--surface-overlay)" }}>
              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=700&fit=crop&crop=center"
                alt="مون باربر"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-base)]/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
