"use client";

import { useEffect, useState } from "react";

/**
 * True when the viewport is narrower than `breakpoint` (default 640px,
 * Tailwind's `sm`). Used by chart components to switch to a
 * mobile-friendly layout (stacked legend, smaller radius, angled ticks)
 * instead of overflowing a narrow container.
 */
export function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = `(max-width: ${breakpoint - 1}px)`;
    const mql = window.matchMedia(query);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
