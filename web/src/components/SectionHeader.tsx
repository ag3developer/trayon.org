import { RevealOnScroll } from "./RevealOnScroll";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: Readonly<SectionHeaderProps>) {
  const isCenter = align === "center";
  return (
    <RevealOnScroll
      className={isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-accent">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-balance text-base text-muted sm:text-lg">
          {description}
        </p>
      )}
    </RevealOnScroll>
  );
}
