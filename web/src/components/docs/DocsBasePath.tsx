"use client";

import { createContext, useContext } from "react";

/**
 * Base path prefix for docs links.
 * - "" when served on the docs.trayon.org subdomain (routes render at the root, e.g. /validators)
 * - "/docs" when served on the main domain under trayon.org/docs/...
 */
const DocsBasePathContext = createContext<string>("/docs");

export function DocsBasePathProvider({
  basePath,
  children,
}: Readonly<{ basePath: string; children: React.ReactNode }>) {
  return (
    <DocsBasePathContext.Provider value={basePath}>
      {children}
    </DocsBasePathContext.Provider>
  );
}

export function useDocsBasePath() {
  return useContext(DocsBasePathContext);
}

/**
 * Resolves a canonical docs href (always written as "/docs" or "/docs/xyz")
 * into the correct link for the current host context.
 */
export function useDocsHref(canonicalHref: string) {
  const basePath = useDocsBasePath();
  if (basePath === "/docs") return canonicalHref;
  const relative = canonicalHref.replace(/^\/docs/, "");
  return relative === "" ? "/" : relative;
}

const MAIN_SITE_URL = "https://trayon.org";

/**
 * Resolves a link that points at the main marketing site (e.g. "/whitepaper"
 * or "/#contact") into the correct href for the current host context.
 * - On the main domain (trayon.org/docs/...), the link stays relative.
 * - On the docs.trayon.org subdomain, it must be an absolute URL back to
 *   the main site, otherwise it resolves against the docs host and 404s.
 */
export function useMainSiteHref(canonicalHref: string) {
  const basePath = useDocsBasePath();
  if (basePath === "/docs") return canonicalHref;
  return `${MAIN_SITE_URL}${canonicalHref}`;
}
