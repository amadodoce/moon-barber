import { Phone, MapPin, Clock } from "lucide-react";

interface FooterProps {
  phone?: string;
  address?: string;
  workingHours?: string;
}

export function Footer({
  phone = "۰۲۱-۱۲۳۴۵۶۷۸",
  address = "تهران، خیابان ولیعصر، پلاک ۱۲۳",
  workingHours = "شنبه تا پنجشنبه — ۹:۰۰ صبح تا ۹:۰۰ شب",
}: FooterProps) {
  return (
    <footer className="border-t border-[#2A2A2A] bg-[#0F0F0F] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Contact */}
          <div>
            <h4 className="mb-4 font-bold text-white">تماس با ما</h4>
            <div className="space-y-3 text-[#9A9A9A]">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#D4A853]" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#D4A853]" />
                <span>{address}</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="mb-4 font-bold text-white">ساعات کاری</h4>
            <div className="space-y-2 text-[#9A9A9A]">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#D4A853]" />
                <span>{workingHours}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 font-bold text-white">دسترسی سریع</h4>
            <div className="space-y-2">
              <a
                href="/book"
                className="block text-[#9A9A9A] transition-colors hover:text-[#D4A853]"
              >
                رزرو نوبت
              </a>
              <a
                href="/login"
                className="block text-[#9A9A9A] transition-colors hover:text-[#D4A853]"
              >
                ورود
              </a>
              <a
                href="/register"
                className="block text-[#9A9A9A] transition-colors hover:text-[#D4A853]"
              >
                ثبت‌نام
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-[#2A2A2A] pt-8 text-center text-sm text-[#6A6A6A]">
          <p>© {new Date().getFullYear()} آرایشگاه مردانه. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
