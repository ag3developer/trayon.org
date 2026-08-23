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

        <StaggerGrid className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:mt-16 sm:grid-cols-2">
          {ITEMS.map((item) => {
            const Icon = getIcon(item.iconKey);
            return (
              <StaggerItem
                key={item.key}
                className="group flex gap-4 border-l-2 border-border pl-5 transition-colors duration-300 hover:border-danger"
              >
                <Icon
                  className="h-5 w-5 flex-shrink-0 text-danger/70 transition-colors group-hover:text-danger"
                  strokeWidth={1.75}
                />
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t(`items.${item.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
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
