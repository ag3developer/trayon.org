import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";

const ITEMS = [
  { key: "delayed", iconKey: "clock" },
  { key: "opaque", iconKey: "eyeOff" },
  { key: "manual", iconKey: "receipt" },
  { key: "fragmented", iconKey: "unlink" },
] as const;

export function Problem() {
  const t = useTranslations("problem");

  return (
    <section id="problem" className="border-t border-border bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <StaggerGrid className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => {
            const Icon = getIcon(item.iconKey);
            return (
              <StaggerItem
                key={item.key}
                className="rounded-lg border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-danger/40 hover:shadow-lg hover:shadow-danger/5"
              >
                <Icon className="h-6 w-6 text-danger" strokeWidth={1.75} />
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {t(`items.${item.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`items.${item.key}.description`)}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </div>
    </section>
  );
}
