import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhitepaperContent } from "@/components/WhitepaperContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "whitepaper" });

  return {
    title: `${t("title")} — Trayon Protocol`,
    description: t("subtitle"),
  };
}

export default function WhitepaperPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WhitepaperContent />
      </main>
      <Footer />
    </>
  );
}
