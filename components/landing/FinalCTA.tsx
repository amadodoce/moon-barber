import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-[#0A0A0A] py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          همین الان نوبت خود را رزرو کنید
        </h2>
        <p className="mb-8 text-lg text-[#9A9A9A]">
          وقت شما ارزشمند است. با رزرو آنلاین، در زمان خود صرفه‌جویی کنید.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4A853] px-8 py-4 text-lg font-semibold text-[#0A0A0A] transition-all hover:bg-[#C49A48] hover:shadow-lg hover:shadow-[#D4A853]/20"
        >
          رزرو نوبت
        </Link>
      </div>
    </section>
  );
}
