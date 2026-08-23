import Image from "next/image";
import { cn } from "@/lib/utils";

// Intrinsic aspect ratio of /trayon-icon.png (tightly cropped icon mark).
const ICON_ASPECT_RATIO = 657 / 899;

interface LogoProps {
  className?: string;
  /** Rendered height in pixels; width is derived from the icon's aspect ratio. */
  size?: number;
}

/**
 * Official Trayon icon mark — a tightly cropped, transparent-background
 * version of public/favicon-tray.png (see /trayon-icon.png). Used
 * alongside a text wordmark in navigation and footer. Rendered at its
 * true aspect ratio so it never looks squeezed into a square box.
 * For the full lockup (icon + "TRAYON" baked in), use <FullLogo /> instead.
 * For icon + live text wordmark together, prefer <LogoLockup />.
 */
export function Logo({ className, size = 28 }: Readonly<LogoProps>) {
  const width = Math.round(size * ICON_ASPECT_RATIO);
  return (
    <Image
      src="/trayon-icon.png"
      alt="Trayon"
      width={width}
      height={size}
      priority
      // Tailwind's preflight sets `img { height: auto }`, which fights with
      // next/image's width/height attrs. Pin both explicitly to keep the
      // real aspect ratio and avoid the "modified but not the other" warning.
      style={{ height: size, width, maxWidth: "100%" }}
      className={cn("flex-shrink-0 object-contain", className)}
    />
  );
}

interface LogoLockupProps {
  className?: string;
  /** Height of the icon mark in pixels; the wordmark's type size scales to match. */
  size?: number;
  /** Optional trailing badge, e.g. "Docs" pill in the docs subdomain header. */
  badge?: React.ReactNode;
}

/**
 * Icon + wordmark lockup: the geometric gold ring/circuit mark paired with
 * "TRAYON" set in uppercase, bold, wide-tracked type. The icon's angular,
 * technical linework calls for a matching typographic weight and letter
 * spacing rather than a soft mixed-case label — this is the canonical way
 * to pair the Logo with text and should be used in the Navbar, docs header,
 * and Footer instead of composing <Logo /> + a plain <span> by hand.
 */
export function LogoLockup({ className, size = 34, badge }: Readonly<LogoLockupProps>) {
  // Wordmark cap-height is tuned relative to icon height so the two visually
  // balance: too large and the bold tracked caps overpower the mark, too
  // small and they read as a caption rather than a brand name.
  const fontSize = Math.round(size * 0.56);
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Logo size={size} />
      <span
        className="font-semibold uppercase leading-none text-foreground"
        style={{ fontSize, letterSpacing: "0.06em" }}
      >
        Trayon
      </span>
      {badge}
    </span>
  );
}

interface FullLogoProps {
  className?: string;
  height?: number;
}

/**
 * Official full Trayon lockup (public/tray-logo.png) — icon + "TRAYON"
 * wordmark baked into a single square image. Use this alone, with no
 * adjacent text, to avoid duplicating the brand name.
 */
export function FullLogo({ className, height = 32 }: Readonly<FullLogoProps>) {
  return (
    <Image
      src="/tray-logo.png"
      alt="Trayon"
      width={height * 4}
      height={height}
      priority
      style={{ height, width: "auto" }}
      className={cn("flex-shrink-0 object-contain", className)}
    />
  );
}
