import { Scissors, Clock } from "lucide-react";

interface ServiceItem {
  name: string;
  description: string | null;
  price: string;
  duration: string;
}

const defaultServices: ServiceItem[] = [
  {
    name: "اصلاح مو",
    description: "اصلاح حرفه‌ای مو با جدیدترین تکنیک‌ها",
    price: "۱۵۰,۰۰۰",
    duration: "۳۰ دقیقه",
  },
  {
    name: "اصلاح ریش",
    description: "طراحی و اصلاح ریش با دقت بالا",
    price: "۱۰۰,۰۰۰",
    duration: "۲۰ دقیقه",
  },
  {
    name: "پکیج کامل",
    description: "اصلاح مو + ریش + ماساژ صورت",
    price: "۲۵۰,۰۰۰",
    duration: "۶۰ دقیقه",
  },
];

interface ServicesProps {
  services?: ServiceItem[];
}

export function Services({ services = defaultServices }: ServicesProps) {
  return (
    <section className="bg-[#0F0F0F] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest text-[#D4A853]">
            سرویس‌های ما
          </p>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            خدمات آرایشگاه
          </h2>
        </div>

        {/* Services grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="group rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-8 transition-all hover:border-[#D4A853]/30"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4A853]/10">
                <Scissors className="h-6 w-6 text-[#D4A853]" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">
                {service.name}
              </h3>
              <p className="mb-6 text-[#9A9A9A]">{service.description}</p>
              <div className="flex items-center justify-between border-t border-[#2A2A2A] pt-4">
                <span className="text-[#D4A853]">{service.price} تومان</span>
                <span className="flex items-center gap-1 text-sm text-[#6A6A6A]">
                  <Clock className="h-4 w-4" />
                  {service.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
