"use client";

import { ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NetworkBackground } from "./NetworkBackground";
import { TypingText } from "./TypingText";

const STATS = [
  { key: "validators", value: "1,000+" },
  { key: "continents", value: "6" },
  { key: "verification", value: "<5min" },
  { key: "uptime", value: "99.99%" },
] as const;

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-grid">
      <NetworkBackground />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {t("eyebrow")}
          </motion.span>

          <TypingText
            as="h1"
            text={t("title")}
            className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/whitepaper"
              className="glow-accent inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <FileText className="h-4 w-4" strokeWidth={2} />
              {t("primaryCta")}
            </Link>
            <a
              href="#contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:w-auto"
            >
              {t("secondaryCta")}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
          </motion.div>
        </div>

        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:mt-20 sm:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div
              key={stat.key}
              className="rounded-lg border border-border bg-surface/60 px-4 py-5 text-center transition-colors hover:border-accent/40"
            >
              <dd className="font-mono text-2xl font-semibold text-accent sm:text-3xl">
                {stat.value}
              </dd>
              <dt className="mt-1 text-xs text-muted sm:text-sm">
                {t(`stats.${stat.key}`)}
              </dt>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
