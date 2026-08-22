import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";

const ITEMS = [
  { key: "government", iconKey: "landmark" },
  { key: "corporate", iconKey: "building2" },
  { key: "judicial", iconKey: "scale" },
  { key: "markets", iconKey: "candlestickChart" },
] as const;

export function UseCases() {
  const t = useTranslations("useCases");

  return (
    <section id="use-cases" className="border-t border-border bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        <StaggerGrid className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2">
          {ITEMS.map((item) => {
            const Icon = getIcon(item.iconKey);
            return (
              <StaggerItem
                key={item.key}
                className="flex gap-4 rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent-soft">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t(`items.${item.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t(`items.${item.key}.description`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
