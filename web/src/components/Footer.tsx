import { useTranslations } from "next-intl";
import { LogoLockup } from "./Logo";

const COLUMNS = [
  {
    key: "protocol",
    links: [
      { key: "architecture", href: "#architecture" },
      { key: "token", href: "#token" },
      { key: "roadmap", href: "#roadmap" },
    ],
  },
  {
    key: "resources",
    links: [
      { key: "whitepaper", href: "/whitepaper" },
      { key: "github", href: "https://github.com/trayon-protocol" },
      { key: "docs", href: "https://docs.trayon.org" },
    ],
  },
  {
    key: "company",
    links: [
      { key: "partnerships", href: "#contact" },
      { key: "contact", href: "#contact" },
    ],
  },
] as const;

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="/" className="flex items-center">
              <LogoLockup size={28} />
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {t("description")}
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.key}>
              <h4 className="text-sm font-semibold text-foreground">
                {t(`columns.${column.key}.title`)}
              </h4>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {t(`columns.${column.key}.${link.key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {t("copyright")}
          </p>
          <p className="text-xs text-muted">{t("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
