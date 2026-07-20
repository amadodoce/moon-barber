import { Phone, MapPin, Clock } from "lucide-react";

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
    <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-base)] py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Statement close — single column, left-aligned */}
        <div className="max-w-md">
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--booking-gold)]">
            <Phone className="h-5 w-5 text-[var(--surface-base)]" />
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            وقت شما ارزشمند است
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            با رزرو آنلاین، در زمان خود صرفه‌جویی کنید.
          </p>
        </div>

        {/* Info row — inline, not columns */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-[var(--text-secondary)]">
          <a
            href={toTelHref(phone)}
            className="flex items-center gap-2 transition-colors duration-150 hover:text-[var(--booking-gold)]"
          >
            <Phone className="h-3.5 w-3.5 text-[var(--booking-gold)]" />
            {phone}
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[var(--booking-gold)]" />
            {address}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[var(--booking-gold)]" />
            {workingHours}
          </span>
        </div>

        {/* Bottom line */}
        <div className="mt-10 border-t border-[var(--surface-border)] pt-6 text-xs text-[var(--text-faint)]">
          <p>© {new Date().getFullYear()} آرایشگاه مردانه</p>
        </div>
      </div>
    </footer>
  );
}
