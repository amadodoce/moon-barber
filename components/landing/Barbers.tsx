import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/brand/SurfaceCard";

interface BarberItem {
  name: string;
  specialty: string;
  experience: string;
  avatar?: string;
}

const defaultBarbers: BarberItem[] = [
  {
    name: "علی محمدی",
    specialty: "اصلاح مو و ریش",
    experience: "۸ سال سابقه",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "محمد رضایی",
    specialty: "طراحی خط ریش",
    experience: "۵ سال سابقه",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "حسین عباسی",
    specialty: "اصلاح مو مردانه",
    experience: "۱۰ سال سابقه",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  },
];

interface BarbersProps {
  barbers?: BarberItem[];
}

export function Barbers({ barbers = defaultBarbers }: BarbersProps) {
  return (
    <section
      id="team"
      className="scroll-mt-24 bg-[var(--color-paper)] py-[var(--space-2xl)] md:py-[var(--space-3xl)]"
    >
      <div className="mx-auto max-w-6xl px-[var(--space-md)]">
        <div className="mb-[var(--space-xl)] md:ms-auto md:max-w-md md:text-end">
          <p className="text-[var(--text-xs)] uppercase tracking-[0.14em] text-[var(--color-accent)]">
            تیم ما
          </p>
          <h2
            className="mt-[var(--space-2xs)] font-semibold text-[var(--color-ink)]"
            style={{ fontSize: "var(--text-display-s)" }}
          >
            آرایشگران حرفه‌ای
          </h2>
          <p className="mt-[var(--space-sm)] text-[var(--text-sm)] text-[var(--color-ink-muted)]">
            استادکاران مون باربر
          </p>
        </div>

        <div className="space-y-[var(--space-sm)]">
          {barbers.map((barber) => (
            <SurfaceCard
              key={barber.name}
              className="transition-colors duration-[var(--dur-short)] hover:border-[color-mix(in_oklch,var(--color-accent)_30%,var(--color-rule))]"
            >
              <div className="flex items-center gap-[var(--space-md)]">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color-mix(in_oklch,var(--color-accent)_25%,var(--color-rule))] bg-[var(--color-accent-soft)]">
                  {barber.avatar ? (
                    <Image
                      src={barber.avatar}
                      alt={barber.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <User
                      className="h-6 w-6 text-[var(--color-accent)]/60"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[var(--text-md)] font-semibold text-[var(--color-ink)]">
                    {barber.name}
                  </h3>
                  <p className="mt-[var(--space-3xs)] text-[var(--text-sm)] text-[var(--color-accent)]">
                    {barber.specialty}
                  </p>
                </div>
                <span className="shrink-0 text-[var(--text-xs)] text-[var(--color-ink-faint)]">
                  {barber.experience}
                </span>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="mt-[var(--space-xl)] md:text-end">
          <Button variant="brand" render={<Link href="/book" />}>
            رزرو با تیم ما
          </Button>
        </div>
      </div>
    </section>
  );
}
