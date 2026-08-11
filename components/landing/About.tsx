import Image from "next/image";
import Link from "next/link";
import { Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function About({
  text = "ما با سال‌ها تجربه در ارائه خدمات باربرین، تلاش می‌کنیم تا بهترین تجربه را برای شما فراهم کنیم.",
}: AboutProps) {
  return (
    <section className="bg-[var(--color-paper-2)] py-[var(--space-2xl)] md:py-[var(--space-3xl)]">
      <div className="mx-auto max-w-6xl px-[var(--space-md)]">
        <div className="grid items-center gap-[var(--space-xl)] md:grid-cols-[1fr_auto]">
          <div className="max-w-lg">
            <p className="text-[var(--text-xs)] uppercase tracking-[0.14em] text-[var(--color-accent)]">
              درباره ما
            </p>
            <h2
              className="mt-[var(--space-2xs)] font-semibold text-[var(--color-ink)]"
              style={{ fontSize: "var(--text-display-s)" }}
            >
              تجربه‌ای متفاوت از مون باربر
            </h2>
            <p className="mt-[var(--space-md)] max-w-prose text-[var(--text-md)] leading-relaxed text-[var(--color-ink-muted)]">
              {text}
            </p>

            <div className="mt-[var(--space-lg)] space-y-[var(--space-md)]">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-[var(--space-sm)]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-accent-soft)]">
                    <feature.icon
                      className="h-4 w-4 text-[var(--color-accent)]"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-sm)] font-semibold text-[var(--color-ink)]">
                      {feature.title}
                    </h4>
                    <p className="mt-[var(--space-3xs)] text-[var(--text-xs)] text-[var(--color-ink-muted)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[var(--space-xl)]">
              <Button variant="brand" render={<Link href="/book" />}>
                رزرو نوبت
              </Button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative h-72 w-60 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)]">
              <Image
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=700&fit=crop&crop=center"
                alt="مون باربر"
                fill
                sizes="240px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-paper)]/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
