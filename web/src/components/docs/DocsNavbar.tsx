"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowLeft } from "lucide-react";
import { DocsSidebar } from "./DocsSidebar";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Logo } from "../Logo";

export function DocsNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/docs" className="flex items-center gap-2">
            <Logo size={34} />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Trayon
            </span>
            <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-medium text-muted">
              Docs
            </span>
          </Link>
        </div>

        <a
          href="/"
          className="hidden items-center gap-2 text-sm text-muted transition-colors hover:text-accent sm:flex"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to trayon.org
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
            aria-label="Toggle documentation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <DocsSidebar />
          <a
            href="/"
            className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Back to trayon.org
          </a>
        </div>
      )}
    </header>
  );
}
