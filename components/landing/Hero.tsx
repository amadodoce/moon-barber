import { Great_Vibes } from "next/font/google";
import { HeroParallax } from "@/components/landing/HeroParallax";

const heroScript = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface HeroProps {
  shopName?: string;
  subtitle?: string;
}

export function Hero({ shopName }: HeroProps) {
  return (
    <HeroParallax shopName={shopName} scriptFontClass={heroScript.className} />
  );
}
