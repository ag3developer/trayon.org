"use client";

import type { ReactNode } from "react";
import { useMainSiteHref } from "./DocsBasePath";

/**
 * Anchor for links that point at the main marketing site (e.g. "/whitepaper",
 * "/#contact") from within the docs section. Resolves to an absolute
 * "https://trayon.org/..." URL when rendered on the docs.trayon.org
 * subdomain, and stays relative on the main domain.
 */
export function MainSiteLink({
  href,
  children,
}: Readonly<{ href: string; children: ReactNode }>) {
  const resolvedHref = useMainSiteHref(href);
  const isAbsolute = resolvedHref.startsWith("http");

  return (
    <a
      href={resolvedHref}
      target={isAbsolute ? "_blank" : undefined}
      rel={isAbsolute ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
