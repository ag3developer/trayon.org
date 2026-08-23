import React from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { WhitepaperDocument } from "@/lib/pdf/whitepaper-document";

export const runtime = "nodejs";

async function toDataUri(fileName: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", fileName);
  const buffer = await readFile(filePath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

// Accept dynamic locale from query params
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";

    // Use the cropped icon mark (same asset as the site's <Logo />), not the
    // full lockup with baked-in wordmark — the PDF renders its own "TRAYON"
    // text next to it, exactly like the website header.
    const [logoMark] = await Promise.all([toDataUri("trayon-icon.png")]);

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <WhitepaperDocument locale={locale} logoMark={logoMark} />
    );

    // Return PDF with proper headers
    return new Response(pdfBuffer as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="trayon-whitepaper-${locale}.pdf"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Error generating PDF", { status: 500 });
  }
}
