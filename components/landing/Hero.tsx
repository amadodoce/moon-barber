import { HeroParallax } from "@/components/landing/HeroParallax";

interface HeroProps {
  shopName?: string;
  subtitle?: string;
}

export function Hero({ shopName }: HeroProps) {
  return <HeroParallax shopName={shopName} />;
}
