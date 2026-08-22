import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";

const FACTS = [
  { key: "supply", iconKey: "coins" },
  { key: "stake", iconKey: "lock" },
  { key: "burn", iconKey: "flame" },
  { key: "governance", iconKey: "vote" },
] as const;

export function Token() {
  const t = useTranslations("token");

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
      </div>
    </section>
  );
}
