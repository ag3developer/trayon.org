import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";

const PHASES = [
  { key: "testnet", iconKey: "flaskConical" },
  { key: "beta", iconKey: "rocket" },
  { key: "expansion", iconKey: "globe2" },
  { key: "standard", iconKey: "trophy" },
] as const;

export function Roadmap() {
  const t = useTranslations("roadmap");

  return (
    <section id="roadmap" className="border-t border-border bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        <div className="relative mt-14 sm:mt-20">
          {/* Connecting timeline line across all four phases (desktop only) */}
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />

          <StaggerGrid className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {PHASES.map((phase) => {
              const Icon = getIcon(phase.iconKey);
              return (
                <StaggerItem key={phase.key} className="group relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-background transition-colors duration-300 group-hover:border-accent">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                  </div>
                  <span className="mt-4 block font-mono text-xs text-accent">
                    {t(`phases.${phase.key}.period`)}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
                    {t(`phases.${phase.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t(`phases.${phase.key}.description`)}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </div>
    </section>
  );
}
