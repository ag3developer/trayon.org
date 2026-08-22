import { DocsNavbar } from "@/components/docs/DocsNavbar";

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <DocsNavbar />
      <main className="flex-1 bg-grid">{children}</main>
    </>
  );
}
