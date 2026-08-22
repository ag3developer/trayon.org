import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";

const STEPS = [
  { key: "ingest", iconKey: "databaseZap" },
  { key: "validate", iconKey: "scanSearch" },
  { key: "consensus", iconKey: "users" },
  { key: "settle", iconKey: "shieldCheck" },
] as const;

export function Protocol() {
  const t = useTranslations("protocol");

  return (
    <section id="protocol" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <StaggerGrid className="mt-12 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = getIcon(step.iconKey);
            return (
              <StaggerItem
                key={step.key}
                className="relative rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {t(`steps.${step.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`steps.${step.key}.description`)}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
