import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="border-y border-[var(--color-rule)] bg-[var(--color-paper)] py-[var(--space-2xl)] md:py-[var(--space-3xl)]">
      <div className="mx-auto max-w-6xl px-[var(--space-md)]">
        <div className="flex flex-col items-start gap-[var(--space-lg)] md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="text-[var(--text-xs)] uppercase tracking-[0.14em] text-[var(--color-accent)]">
              آماده رزرو
            </p>
            <h2
              className="mt-[var(--space-2xs)] font-semibold text-[var(--color-ink)]"
              style={{ fontSize: "var(--text-2xl)" }}
            >
              همین الان نوبت خود را رزرو کنید
            </h2>
            <p className="mt-[var(--space-sm)] text-[var(--text-sm)] text-[var(--color-ink-muted)]">
              وقت شما ارزشمند است.
            </p>
          </div>
          <Button variant="brand" render={<Link href="/book" />}>
            رزرو نوبت
          </Button>
        </div>
      </div>
    </section>
  );
}
