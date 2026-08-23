"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./theme/ThemeToggle";
import { LogoLockup } from "./Logo";
import { Wallet } from "./Wallet";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  const navItems = [
    { key: "problem", href: "#problem" },
    { key: "protocol", href: "#protocol" },
    { key: "useCases", href: "#use-cases" },
    { key: "architecture", href: "#architecture" },
    { key: "roadmap", href: "#roadmap" },
    { key: "token", href: "#token" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-shrink-0 items-center">
          <LogoLockup size={34} />
        </Link>

        {/* Desktop navigation - hidden on md and below, with overflow protection */}
        <nav className="hidden min-w-0 items-center gap-4 overflow-x-auto md:gap-6 lg:flex lg:gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex-shrink-0 whitespace-nowrap text-sm text-muted transition-colors hover:text-foreground"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        {/* Desktop controls - hidden on md and below */}
        <div className="hidden items-center gap-2 flex-shrink-0 md:gap-3 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <Wallet />
          <a
            href="#contact"
            className="flex-shrink-0 whitespace-nowrap rounded-md border border-accent/40 bg-accent-soft px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/10 md:px-4 md:py-2 md:text-sm lg:px-4"
          >
            {t("partner")}
          </a>
        </div>

        {/* Mobile/Tablet controls - shown on md and below */}
        <div className="flex min-w-0 items-center gap-1.5 flex-shrink-0 md:hidden">
          <div className="hidden items-center gap-1.5 sm:flex">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <Wallet />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex flex-shrink-0 items-center justify-center rounded-md p-2 text-foreground"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-6 pt-2 lg:hidden">
          <div className="flex items-center gap-1.5 py-2 sm:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm text-muted hover:bg-surface hover:text-foreground"
              >
                {t(item.key)}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md border border-accent/40 bg-accent-soft px-3 py-3 text-center text-sm font-medium text-accent"
            >
              {t("partner")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
