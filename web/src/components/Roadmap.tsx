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

        <StaggerGrid className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase) => {
            const Icon = getIcon(phase.iconKey);
            return (
              <StaggerItem
                key={phase.key}
                className="rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <span className="font-mono text-xs text-accent">
                  {t(`phases.${phase.key}.period`)}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                  <h3 className="text-base font-semibold text-foreground">
                    {t(`phases.${phase.key}.title`)}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`phases.${phase.key}.description`)}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
