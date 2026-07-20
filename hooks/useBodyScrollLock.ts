"use client";

import { useEffect } from "react";

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const scrollY = window.scrollY;

    // iOS Safari: overflow:hidden on body alone doesn't prevent scrolling
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
