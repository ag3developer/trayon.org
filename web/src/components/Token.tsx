"use client";

import { ArrowRight, Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";
import { RevealOnScroll } from "./RevealOnScroll";
import { TokenAllocationChart, TOKEN_ALLOCATION } from "./TokenAllocationChart";
import { useChartColors } from "./docs/charts/useChartColors";

const ALLOCATION_COLOR_KEYS = ["accent", "violet", "blue", "gold", "rose", "signal"] as const;

const FACTS = [
  { key: "supply", iconKey: "coins" },
  { key: "stake", iconKey: "lock" },
  { key: "burn", iconKey: "flame" },
  { key: "governance", iconKey: "vote" },
] as const;

const UTILITY = [
  { key: "gas", iconKey: "databaseZap" },
  { key: "staking", iconKey: "shieldCheck" },
  { key: "marketplace", iconKey: "scanSearch" },
  { key: "governance", iconKey: "vote" },
] as const;

export function Token() {
  const t = useTranslations("token");
  const c = useChartColors();
  const allocationColors = ALLOCATION_COLOR_KEYS.map((key) => c[key]);

  return (
    <section id="token" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <StaggerGrid className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact) => {
            const Icon = getIcon(fact.iconKey);
            return (
              <StaggerItem
                key={fact.key}
                className="rounded-lg border border-border bg-surface p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <Icon className="mx-auto h-6 w-6 text-accent" strokeWidth={1.75} />
                <p className="mt-4 font-mono text-lg font-semibold text-foreground">
                  {t(`facts.${fact.key}.value`)}
                </p>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {t(`facts.${fact.key}.label`)}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-[1.1fr_1fr]">
          {/* Allocation donut + breakdown table */}
          <RevealOnScroll className="rounded-lg border border-border bg-surface p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t("allocationTitle")}
            </h3>
            <div className="mt-4">
              <TokenAllocationChart />
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 text-left font-semibold">Category</th>
                  <th className="py-2 text-right font-semibold">Share</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {TOKEN_ALLOCATION.map((row, idx) => (
                  <tr key={row.name} className="border-b border-border/60 last:border-0">
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: allocationColors[idx] }}
                        />
                        <span className="text-foreground">{row.name}</span>
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-foreground">{row.value}%</td>
                    <td className="py-2 text-right text-muted">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </RevealOnScroll>

          {/* Utility + burn highlight */}
          <div className="flex flex-col gap-6">
            <RevealOnScroll delay={0.1} className="rounded-lg border border-border bg-surface p-6 sm:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t("utilityTitle")}
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {UTILITY.map((item) => {
                  const Icon = getIcon(item.iconKey);
                  return (
                    <li key={item.key} className="flex gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent-soft">
                        <Icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t(`utility.${item.key}.title`)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {t(`utility.${item.key}.description`)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </RevealOnScroll>

            <RevealOnScroll
              delay={0.2}
              className="flex flex-1 flex-col justify-between gap-4 rounded-lg border border-danger/30 bg-danger/5 p-6 sm:p-8"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-danger" strokeWidth={1.75} />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-danger">
                    {t("burnTitle")}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t("burnDescription")}
                </p>
              </div>
              <a
                href="/docs/tokenomics"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
              >
                {t("ctaLabel")}
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
