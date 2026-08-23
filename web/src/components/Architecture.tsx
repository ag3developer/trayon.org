import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";
import { RevealOnScroll } from "./RevealOnScroll";
import { WorldMap } from "./WorldMap";

const LAYERS = [
  { key: "settlement", iconKey: "layers" },
  { key: "consensus", iconKey: "network" },
  { key: "ai", iconKey: "brainCircuit" },
  { key: "data", iconKey: "hardDrive" },
] as const;

export function Architecture() {
  const t = useTranslations("architecture");

  return (
    <section id="architecture" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <StaggerGrid className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {LAYERS.map((layer) => {
            const Icon = getIcon(layer.iconKey);
            return (
              <StaggerItem
                key={layer.key}
                className="rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} />
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {t(`layers.${layer.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`layers.${layer.key}.description`)}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <RevealOnScroll className="mt-10 rounded-lg border border-border bg-surface/60 p-6 sm:mt-12 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("regionsLabel")}
          </span>
          <div className="mx-auto mt-4 max-w-3xl">
            <WorldMap />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
