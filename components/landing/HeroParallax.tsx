"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroParallaxProps {
  shopName?: string;
}

const CLOUD_LAYERS = [
  { src: "/images/hero-layer/cloude-6.png", className: "hero-cloud hero-cloud-6", x: 0.25, y: 0.18 },
  { src: "/images/hero-layer/cloude-3.png", className: "hero-cloud hero-cloud-3", x: 0.45, y: 0.22 },
  { src: "/images/hero-layer/cloud-1.png", className: "hero-cloud hero-cloud-1", x: 0.62, y: 0.15 },
  { src: "/images/hero-layer/cloude-7.png", className: "hero-cloud hero-cloud-7", x: 0.35, y: 0.32 },
  { src: "/images/hero-layer/cloude-2.png", className: "hero-cloud hero-cloud-2", x: 0.55, y: 0.28 },
  { src: "/images/hero-layer/cloude-11.png", className: "hero-cloud hero-cloud-11", x: 0.72, y: 0.35 },
  { src: "/images/hero-layer/cloude-4.png", className: "hero-cloud hero-cloud-4", x: 0.28, y: 0.38 },
  { src: "/images/hero-layer/cloude-8.png", className: "hero-cloud hero-cloud-8", x: 0.48, y: 0.42 },
  { src: "/images/hero-layer/cloude-9.png", className: "hero-cloud hero-cloud-9", x: 0.68, y: 0.40 },
  { src: "/images/hero-layer/cloude-5.png", className: "hero-cloud hero-cloud-5", x: 0.40, y: 0.45 },
  { src: "/images/hero-layer/cloude-10.png", className: "hero-cloud hero-cloud-10", x: 0.58, y: 0.48 },
] as const;

export function HeroParallax({ shopName = "مون باربر" }: HeroParallaxProps) {
  const runwayRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pinned, setPinned] = useState(false);

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
      setPinned(progress >= 0.82);
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
      style={{ "--hero-progress": reducedMotion ? "1" : "0" } as React.CSSProperties}
    >
      <div className="hero-parallax-stage">
        <div className="hero-parallax-scene" aria-hidden="true">
          {reducedMotion ? (
            <Image
              src="/images/hero-image.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-parallax-fallback"
            />
          ) : (
            <>
              <div className="hero-layer hero-layer-sky">
                <Image
                  src="/images/hero-layer/layer-starry-night-sky.png"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="hero-layer-image"
                />
              </div>

              <div className="hero-layer hero-layer-left-hill" data-depth="0.2">
                <Image
                  src="/images/hero-layer/left-hill.png"
                  alt=""
                  fill
                  sizes="50vw"
                  className="hero-layer-image hero-layer-image-fit"
                />
              </div>

              <div className="hero-layer hero-layer-right-hill" data-depth="0.18">
                <Image
                  src="/images/hero-layer/right-hill.png"
                  alt=""
                  fill
                  sizes="50vw"
                  className="hero-layer-image hero-layer-image-fit"
                />
              </div>

              <div className="hero-layer hero-layer-moon" data-depth="0.12">
                <Image
                  src="/images/hero-layer/moon.png"
                  alt=""
                  fill
                  sizes="60vw"
                  className="hero-layer-image hero-layer-image-fit"
                />
              </div>

              {CLOUD_LAYERS.map((cloud) => (
                <div
                  key={cloud.src}
                  className={`hero-layer ${cloud.className}`}
                  data-depth-x={cloud.x}
                  data-depth-y={cloud.y}
                >
                  <Image
                    src={cloud.src}
                    alt=""
                    fill
                    sizes="30vw"
                    className="hero-layer-image hero-layer-image-fit"
                  />
                </div>
              ))}

              <div className="hero-layer hero-layer-main-hill" data-depth="0.78">
                <Image
                  src="/images/hero-layer/main-hill.png"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="hero-layer-image hero-layer-image-fit"
                />
              </div>
            </>
          )}

          <div className="hero-parallax-vignette" />
          <div className="hero-parallax-moon-glow" />
        </div>

        <div className="hero-parallax-content">
          <h1 className="hero-parallax-title" dir="ltr">
            Moonbarber
          </h1>
        </div>

        <div
          className={`hero-parallax-cta-wrap${pinned ? " hero-parallax-cta-wrap--pinned" : ""}`}
        >
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
