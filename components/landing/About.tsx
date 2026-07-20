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
            <div className="relative h-72 w-60 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-overlay)] p-6">
              <div className="space-y-3">
                <div className="h-2.5 w-3/4 rounded-full bg-[var(--booking-gold)]/15" />
                <div className="h-2.5 w-1/2 rounded-full bg-[var(--booking-gold)]/8" />
                <div className="h-2.5 w-2/3 rounded-full bg-[var(--booking-gold)]/8" />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--booking-gold)]/20 bg-[var(--booking-gold)]/8">
                  <Shield className="h-4 w-4 text-[var(--booking-gold)]" />
                </div>
                <div>
                  <div className="h-2 w-16 rounded-full bg-[var(--booking-gold)]/12" />
                  <div className="mt-1.5 h-2 w-10 rounded-full bg-[var(--booking-gold)]/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
