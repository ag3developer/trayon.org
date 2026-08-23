"use client";

import { useEffect, useState } from "react";

export interface ChartColors {
  accent: string;
  accentStrong: string;
  muted: string;
  foreground: string;
  border: string;
  surface: string;
  surface2: string;
  signal: string;
  danger: string;
  violet: string;
  gold: string;
  rose: string;
  blue: string;
}

const FALLBACK: ChartColors = {
  accent: "#35d0b0",
  accentStrong: "#1fb894",
  muted: "#8a94a6",
  foreground: "#e7ecf3",
  border: "#1c2433",
  surface: "#0a0e18",
  surface2: "#10151f",
  signal: "#f0a84e",
  danger: "#e2574c",
  violet: "#a78bfa",
  gold: "#e7c66b",
  rose: "#f472b6",
  blue: "#60a5fa",
};

const PALETTE_VARS: [keyof ChartColors, string][] = [
  ["accent", "--accent"],
  ["accentStrong", "--accent-strong"],
  ["muted", "--muted"],
  ["foreground", "--foreground"],
  ["border", "--border"],
  ["surface", "--surface"],
  ["surface2", "--surface-2"],
  ["signal", "--signal"],
  ["danger", "--danger"],
];

// A few extra qualitative colors for multi-series charts that don't have a
// dedicated CSS variable — kept static since they're purely decorative and
// need to stay visually distinct in both themes.
const EXTRA: Pick<ChartColors, "violet" | "gold" | "rose" | "blue"> = {
  violet: "#a78bfa",
  gold: "#e7c66b",
  rose: "#f472b6",
  blue: "#60a5fa",
};

/**
 * Reads the current theme's CSS custom properties so chart fills/strokes
 * stay in sync with light/dark mode without hardcoding hex values.
 * Re-reads whenever `data-theme` changes on <html>.
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>({ ...FALLBACK, ...EXTRA });

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      const next = { ...FALLBACK, ...EXTRA };
      for (const [key, cssVar] of PALETTE_VARS) {
        const value = styles.getPropertyValue(cssVar).trim();
        if (value) (next as ChartColors)[key] = value;
      }
      setColors(next);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
