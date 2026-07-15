import Link from "next/link";
import { Scissors } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Decorative geometric pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute right-[10%] top-[15%] h-64 w-64 rounded-full border border-[#D4A853]" />
        <div className="absolute bottom-[20%] left-[8%] h-48 w-48 rounded-full border border-[#D4A853]" />
        <div className="absolute right-[25%] bottom-[10%] h-32 w-32 rotate-45 border border-[#D4A853]" />
      </div>

      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D4A853]/20 bg-[#1A1A1A]">
          <Scissors className="h-10 w-10 text-[#D4A853]" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
          آرایشگاه مردانه
        </h1>

        {/* Decorative line */}
        <div className="mx-auto my-6 h-px w-24 bg-[#D4A853]" />

        {/* Subtext */}
        <p className="mx-auto max-w-xl text-lg text-[#9A9A9A] md:text-xl">
          رزرو آنلاین نوبت در چند ثانیه
        </p>

        {/* CTA */}
        <Link
          href="/book"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-8 py-4 text-lg font-semibold text-[#0A0A0A] transition-all hover:bg-[#C49A48] hover:shadow-lg hover:shadow-[#D4A853]/20"
        >
          رزرو نوبت
        </Link>
      </div>
    </section>
  );
}
