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
    if (!url.pathname.startsWith("/docs")) {
      url.pathname = `/docs${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
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
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
