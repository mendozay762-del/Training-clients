"use client";

import { useEffect } from "react";

/**
 * Prevents the document body from scrolling while `locked` is true.
 * Restores the previous overflow value on unlock and on unmount.
 *
 * Used to keep the underlying page from scrolling under a fixed
 * overlay/modal — disorienting on touch devices when both layers
 * accept scroll gestures.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    if (typeof document === "undefined") return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
