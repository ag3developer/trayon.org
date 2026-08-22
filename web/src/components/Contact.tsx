import { useTranslations } from "next-intl";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./SectionHeader";
import { StaggerGrid, StaggerItem } from "./StaggerGrid";

const CHANNELS = [
  { key: "partnerships", iconKey: "handshake" },
  { key: "developers", iconKey: "code2" },
  { key: "general", iconKey: "mail" },
] as const;

export function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="border-t border-border bg-surface/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />

        <StaggerGrid className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-3">
          {CHANNELS.map((channel) => {
            const Icon = getIcon(channel.iconKey);
            return (
              <StaggerItem
                key={channel.key}
                className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <Icon className="h-6 w-6 text-accent" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t(`channels.${channel.key}.label`)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t(`channels.${channel.key}.value`)}
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
