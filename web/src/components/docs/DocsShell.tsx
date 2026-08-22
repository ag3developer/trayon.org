import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { DocsSidebar } from "./DocsSidebar";
import { docsNavFlat } from "@/lib/docs-nav";

interface DocsShellProps {
  children: ReactNode;
  currentHref: string;
}

export function DocsShell({ children, currentHref }: Readonly<DocsShellProps>) {
  const index = docsNavFlat.findIndex((item) => item.href === currentHref);
  const prev = index > 0 ? docsNavFlat[index - 1] : undefined;
  const next =
    index >= 0 && index < docsNavFlat.length - 1
      ? docsNavFlat[index + 1]
      : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <DocsSidebar />
          </div>
        </aside>

        <div className="min-w-0">
          <article className="docs-prose">{children}</article>

          <div className="mt-16 flex items-center justify-between gap-4 border-t border-border pt-6">
            {prev ? (
              <Link
                href={prev.href}
                className="group flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                <span>
                  <span className="block text-xs text-muted">Previous</span>
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={next.href}
                className="group flex items-center gap-2 text-right text-sm text-muted transition-colors hover:text-accent"
              >
                <span>
                  <span className="block text-xs text-muted">Next</span>
                  {next.title}
                </span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
