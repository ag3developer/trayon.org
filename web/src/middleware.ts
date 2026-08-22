import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // `/docs` is a standalone, English-only documentation section that lives
  // outside the [locale] segment, so it must be excluded from i18n routing.
  matcher: ["/((?!api|trpc|_next|_vercel|docs|.*\\..*).*)"],
};
