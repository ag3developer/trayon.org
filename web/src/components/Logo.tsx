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
