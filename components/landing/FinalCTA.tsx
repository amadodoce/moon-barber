import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-[var(--surface-base)] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
              همین الان نوبت خود را رزرو کنید
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              وقت شما ارزشمند است.
            </p>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--booking-gold)] px-7 py-3.5 text-base font-semibold text-[var(--surface-base)] transition-colors duration-200 hover:bg-[var(--booking-gold-hover)]"
          >
            رزرو نوبت
          </Link>
        </div>
      </div>
    </section>
  );
}
