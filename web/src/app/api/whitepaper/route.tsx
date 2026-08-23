import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { WhitepaperDocument } from "@/lib/pdf/whitepaper-document";

// Accept dynamic locale from query params
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <WhitepaperDocument locale={locale} />
    );

    // Return PDF with proper headers
    return new Response(pdfBuffer as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="trayon-whitepaper-${locale}.pdf"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Error generating PDF", { status: 500 });
  }
}
