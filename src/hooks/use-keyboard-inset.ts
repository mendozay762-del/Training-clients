"use client";

import { useEffect, useState } from "react";

/**
 * Returns the height (in CSS px) that the on-screen keyboard is currently
 * covering at the bottom of the viewport. Returns 0 when no keyboard is
 * visible or when the browser doesn't expose the Visual Viewport API.
 *
 * Use to offset fixed-position bottom UI so it doesn't get hidden under
 * the iOS keyboard or its accessory bar (autofill suggestions, etc.).
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const covered =
          window.innerHeight - vv.height - vv.offsetTop;
        setInset(covered > 1 ? covered : 0);
      });
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  return inset;
}
