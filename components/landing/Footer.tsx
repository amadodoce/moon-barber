import { Phone, MapPin, Clock } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";

interface FooterProps {
  phone?: string;
  address?: string;
  workingHours?: string;
}

function toTelHref(phone: string): string {
  const normalized = phone
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[^\d+]/g, "");
  return `tel:${normalized}`;
}

export function Footer({
  phone = "۰۲۱-۱۲۳۴۵۶۷۸",
  address = "تهران، خیابان ولیعصر، پلاک ۱۲۳",
  workingHours = "شنبه تا پنجشنبه — ۹:۰۰ صبح تا ۹:۰۰ شب",
}: FooterProps) {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 border-t border-[var(--color-rule)] bg-[var(--color-paper)] pb-[var(--space-xl)] pt-[var(--space-2xl)]"
    >
      <div className="mx-auto max-w-6xl px-[var(--space-md)]">
        {/* Ft1 masthead */}
        <div className="border-b border-[var(--color-rule)] pb-[var(--space-xl)]">
          <BrandMark size="lg" asLink={false} />
          <p className="mt-[var(--space-md)] max-w-md text-[var(--text-lg)] font-medium text-[var(--color-ink)]">
            وقت شما ارزشمند است
          </p>
          <p className="mt-[var(--space-2xs)] max-w-prose text-[var(--text-sm)] text-[var(--color-ink-muted)]">
            با رزرو آنلاین، در زمان خود صرفه‌جویی کنید.
          </p>
        </div>

        <div className="mt-[var(--space-xl)] grid gap-[var(--space-lg)] sm:grid-cols-3">
          <div>
            <p className="mb-[var(--space-2xs)] text-[var(--text-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              تلفن
            </p>
            <a
              href={toTelHref(phone)}
              className="inline-flex min-h-11 items-center gap-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink)] transition-colors duration-[var(--dur-short)] hover:text-[var(--color-accent)]"
            >
              <Phone className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
              {phone}
            </a>
          </div>
          <div>
            <p className="mb-[var(--space-2xs)] text-[var(--text-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              آدرس
            </p>
            <p className="flex min-h-11 items-start gap-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink)]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
              {address}
            </p>
          </div>
          <div>
            <p className="mb-[var(--space-2xs)] text-[var(--text-xs)] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              ساعات کاری
            </p>
            <p className="flex min-h-11 items-start gap-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink)]">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
              {workingHours}
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-xl)] border-t border-[var(--color-rule)] pt-[var(--space-md)]">
          <p className="text-[var(--text-xs)] text-[var(--color-ink-faint)]">
            © {new Date().getFullYear()} مون باربر
          </p>
        </div>
      </div>
    </footer>
  );
}
