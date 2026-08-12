"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const HERO_COVER_IMAGE = "/images/hero-image.jpg";

interface HeroParallaxProps {
  shopName?: string;
  scriptFontClass?: string;
}

export function HeroParallax({
  shopName = "مون باربر",
  scriptFontClass,
}: HeroParallaxProps) {
  const runwayRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway || reducedMotion) return;

    const updateProgress = () => {
      rafRef.current = null;
      const rect = runway.getBoundingClientRect();
      const scrollable = runway.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(scrollable, 1));
      const progress = scrollable > 0 ? scrolled / scrollable : 0;
      runway.style.setProperty("--hero-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [reducedMotion]);

  return (
    <section
      ref={runwayRef}
      className="hero-parallax-runway"
      aria-label={shopName}
    >
      <div className="hero-parallax-stage">
        <div className="hero-parallax-scene">
          <div className="hero-parallax-image-wrap">
            <Image
              src={HERO_COVER_IMAGE}
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className="hero-parallax-image"
            />
          </div>
        </div>

        <div className="hero-parallax-content">
          <h1
            className={`hero-parallax-title${scriptFontClass ? ` ${scriptFontClass}` : ""}`}
            dir="ltr"
          >
            Moonbarber
          </h1>
          <Button
            variant="brand"
            size="lg"
            className="hero-parallax-cta"
            render={<Link href="/book" />}
          >
            رزرو وقت
          </Button>
        </div>
      </div>
    </section>
  );
}
