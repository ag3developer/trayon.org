import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import { DocsBasePathProvider } from "@/components/docs/DocsBasePath";
import "@/styles/globals.css";

const DOCS_HOSTS = ["docs.trayon.org", "docs.trayonorg.vercel.app"];

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trayon Protocol Documentation",
    template: "%s — Trayon Docs",
  },
  description:
    "Technical documentation for the Trayon Protocol: architecture, consensus, oracle & AI validation, smart contracts, tokenomics, and validator operations.",
};

/**
 * Root layout for the standalone /docs section. English-only, not part of
 * the [locale] i18n routing (excluded in proxy.ts matcher).
 */
export default async function DocsRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headerList = await headers();
  const hostname = headerList.get("host") ?? "";
  const isDocsHost = DOCS_HOSTS.some(
    (docsHost) => hostname === docsHost || hostname.startsWith(`${docsHost}:`)
  );
  const basePath = isDocsHost ? "" : "/docs";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <DocsBasePathProvider basePath={basePath}>
            {children}
          </DocsBasePathProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
