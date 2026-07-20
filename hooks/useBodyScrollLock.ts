"use client";

import { useEffect } from "react";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const body = document.body;
    const html = document.documentElement;

    if (locked) {
      const scrollY = window.scrollY;

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.overflow = "hidden";

      html.style.overflow = "hidden"; // اضافه کردن این هم بهتر است
    } else {
      const scrollY = parseInt(body.style.top || "0") * -1;
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";

      html.style.overflow = "";

      window.scrollTo(0, scrollY); // برگرداندن اسکرول به موقعیت قبلی
    }

    return () => {
      // cleanup محکم
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overflow = "";
    };
  }, [locked]);
}