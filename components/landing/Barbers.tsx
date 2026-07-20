import { User } from "lucide-react";

interface BarberItem {
  name: string;
  specialty: string;
  experience: string;
}

const defaultBarbers: BarberItem[] = [
  {
    name: "علی محمدی",
    specialty: "اصلاح مو و ریش",
    experience: "۸ سال سابقه",
  },
  {
    name: "محمد رضایی",
    specialty: "طراحی خط ریش",
    experience: "۵ سال سابقه",
  },
  {
    name: "حسین عباسی",
    specialty: "اصلاح مو مردانه",
    experience: "۱۰ سال سابقه",
  },
];

interface BarbersProps {
  barbers?: BarberItem[];
}

export function Barbers({ barbers = defaultBarbers }: BarbersProps) {
  return (
    <section className="bg-[var(--surface-base)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header — right-aligned for variety */}
        <div className="mb-12 text-right md:ml-auto md:max-w-md">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            آرایشگران حرفه‌ای
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            تیم ما
          </p>
        </div>

        {/* Barbers — list layout, not grid */}
        <div className="space-y-3">
          {barbers.map((barber) => (
            <div
              key={barber.name}
              className="flex items-center gap-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-overlay)] p-5 transition-colors duration-200 hover:border-[var(--booking-gold)]/30"
            >
              {/* Avatar */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--booking-gold)]/20 bg-[var(--booking-gold)]/5">
                <User className="h-6 w-6 text-[var(--booking-gold)]/60" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {barber.name}
                </h3>
                <p className="mt-0.5 text-sm text-[var(--booking-gold)]">
                  {barber.specialty}
                </p>
              </div>
              {/* Experience — right side */}
              <span className="shrink-0 text-xs text-[var(--text-faint)]">
                {barber.experience}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
