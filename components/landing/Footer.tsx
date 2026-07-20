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
    <footer className="border-t border-[#2a2520] bg-[#0c0b09] py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Statement close — single column, left-aligned */}
        <div className="max-w-md">
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A853]">
            <Phone className="h-5 w-5 text-[#0c0b09]" />
          </div>
          <p className="text-lg font-semibold text-[#f5f0e8]">
            وقت شما ارزشمند است
          </p>
          <p className="mt-2 text-sm text-[#6a6458]">
            با رزرو آنلاین، در زمان خود صرفه‌جویی کنید.
          </p>
        </div>

        {/* Info row — inline, not columns */}
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-[#8a8578]">
          <a
            href={toTelHref(phone)}
            className="flex items-center gap-2 transition-colors duration-150 hover:text-[#D4A853]"
          >
            <Phone className="h-3.5 w-3.5 text-[#D4A853]" />
            {phone}
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#D4A853]" />
            {address}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#D4A853]" />
            {workingHours}
          </span>
        </div>

        {/* Bottom line */}
        <div className="mt-10 border-t border-[#2a2520] pt-6 text-xs text-[#4a4538]">
          <p>© {new Date().getFullYear()} آرایشگاه مردانه</p>
        </div>
      </div>
    </footer>
  );
}
