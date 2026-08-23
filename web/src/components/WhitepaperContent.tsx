"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  Landmark,
  Layers,
  BrainCircuit,
  Coins,
  Rocket,
  Globe2,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "./RevealOnScroll";

const SECTIONS = [
  { key: "manifesto", icon: Landmark },
  { key: "architecture", icon: Layers },
  { key: "oracle", icon: BrainCircuit },
  { key: "tokenomics", icon: Coins },
  { key: "roadmap", icon: Rocket },
  { key: "globalization", icon: Globe2 },
] as const;

export function WhitepaperContent() {
  const t = useTranslations("whitepaper");
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].key);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.key);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative bg-grid">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          {t("backCta")}
        </Link>

        <RevealOnScroll className="mx-auto mt-8 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted">
            <FileText className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-muted sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            <span className="rounded-full border border-border px-3 py-1 font-mono">
              {t("version")}
            </span>
            <span>{t("updated")}</span>
          </div>
          <div className="mt-8 flex justify-center">
            <a
              href={`/api/whitepaper?locale=${locale}`}
              download={`trayon-whitepaper-${locale}.pdf`}
              className="glow-accent inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              {t("downloadCta")}
            </a>
          </div>
        </RevealOnScroll>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t("toc")}
              </p>
              <nav className="mt-4 flex flex-col gap-1 border-l border-border pl-4">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.key;
                  return (
                    <a
                      key={section.key}
                      href={`#${section.key}`}
                      className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors ${
                        isActive
                          ? "text-accent"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                      <span>{t(`sections.${section.key}.nav`)}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 space-y-16">
            {SECTIONS.map((section) => (
              <RevealOnScroll key={section.key}>
                <section id={section.key} className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {t(`sections.${section.key}.title`)}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {t
                      .raw(`sections.${section.key}.body`)
                      .map((paragraph: string) => (
                        <p
                          key={paragraph.slice(0, 40)}
                          className="text-base leading-relaxed text-muted"
                        >
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </section>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
