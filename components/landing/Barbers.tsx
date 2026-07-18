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
    <section className="bg-[#0A0A0A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#D4A853]">
            تیم ما
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            آرایشگران حرفه‌ای
          </h2>
        </div>

        {/* Barbers grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {barbers.map((barber) => (
            <div
              key={barber.name}
              className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-center transition-all hover:border-[#D4A853]/30"
            >
              {/* Avatar placeholder */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#D4A853]/30 bg-[#0F0F0F]">
                <User className="h-8 w-8 text-[#6A6A6A]" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-white">
                {barber.name}
              </h3>
              <p className="mb-2 text-sm text-[#D4A853]">
                {barber.specialty}
              </p>
              <p className="text-sm text-[#6A6A6A]">{barber.experience}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
