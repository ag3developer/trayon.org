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

        <div className="relative mt-14 sm:mt-20">
          {/* Connecting line across all four steps (desktop only) */}
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />

          <StaggerGrid className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = getIcon(step.iconKey);
              return (
                <StaggerItem key={step.key} className="group relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-background transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <span className="mt-4 block font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
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
      </div>
    </section>
  );
}
