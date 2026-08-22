"use client";

import { useEffect, useState } from "react";

interface TypingTextProps {
  text: string;
  as?: "h1" | "span";
  className?: string;
  speedMs?: number;
  startDelayMs?: number;
}

/**
 * Typewriter effect for headline text. Falls back to instant full text
 * for users with prefers-reduced-motion, and re-runs when `text` changes
 * (e.g. on locale switch).
 */
export function TypingText({
  text,
  as = "span",
  className,
  speedMs = 22,
  startDelayMs = 150,
}: Readonly<TypingTextProps>) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    let index = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speedMs);
    }, startDelayMs);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speedMs, startDelayMs]);

  const Tag = as;

  return (
    <Tag className={className}>
      {displayed}
      <span
        aria-hidden="true"
        className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-accent align-middle ${
          done ? "animate-pulse" : ""
        }`}
      />
    </Tag>
  );
}
