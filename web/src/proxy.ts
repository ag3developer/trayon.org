import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Hosts that should serve the standalone `/docs` section at the root path,
// e.g. https://docs.trayon.org/tokenomics -> internally /docs/tokenomics
const DOCS_HOSTS = ["docs.trayon.org", "docs.trayonorg.vercel.app"];

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const isDocsHost = DOCS_HOSTS.some(
    (docsHost) => hostname === docsHost || hostname.startsWith(`${docsHost}:`)
  );

  if (isDocsHost) {
    const url = request.nextUrl.clone();
    // If a legacy/cross-referenced link still points at "/docs/xyz" while
    // already on the docs subdomain, redirect to the clean "/xyz" URL so
    // the address bar never shows a duplicated "docs" segment.
    if (url.pathname === "/docs" || url.pathname.startsWith("/docs/")) {
      url.pathname = url.pathname.slice("/docs".length) || "/";
      return NextResponse.redirect(url);
    }
    url.pathname = `/docs${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // `/docs` is a standalone, English-only documentation section that lives
  // outside the [locale] segment, so it must be excluded from i18n routing.
  if (request.nextUrl.pathname.startsWith("/docs")) {
    return NextResponse.next();
  }

  // Redirect bare "/" to the default locale on the main marketing site.
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  // NOTE: "api/" (with trailing slash) so this only excludes the actual
  // /api/* route handlers, not docs pages whose slug happens to start
  // with "api" (e.g. /docs/api-reference -> docs.trayon.org/api-reference).
  matcher: ["/((?!api/|trpc|_next|_vercel|.*\\..*).*)"],
};
