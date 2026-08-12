import Link from "next/link";
import { Great_Vibes } from "next/font/google";
import { Button } from "@/components/ui/button";

const heroScript = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const HERO_COVER_IMAGE = "/images/hero-image.jpg";

interface HeroProps {
  shopName?: string;
  subtitle?: string;
}

export function Hero({ shopName = "مون باربر" }: HeroProps) {
  return (
    <section className="hero-section" aria-label={shopName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_COVER_IMAGE}
        alt=""
        className="hero-cover"
        decoding="async"
        fetchPriority="high"
      />

      <div className="hero-content">
        <h1 className={`hero-title ${heroScript.className}`} dir="ltr">
          Moonbarber
        </h1>
        <Button
          variant="brand"
          size="lg"
          className="hero-cta"
          render={<Link href="/book" />}
        >
          رزرو وقت
        </Button>
      </div>
    </section>
  );
}
