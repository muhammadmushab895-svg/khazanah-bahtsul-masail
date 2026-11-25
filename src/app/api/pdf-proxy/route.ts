import { NextRequest, NextResponse } from "next/server";
import { getDokumenPdfById } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const docId = req.nextUrl.searchParams.get("doc")?.trim();
  if (!docId) {
    return NextResponse.json(
      { error: "Parameter doc wajib diisi." },
      { status: 400 }
    );
  }

  // Whitelisted lookup only — never proxies arbitrary URLs
  const pdfDoc = getDokumenPdfById(docId);
  if (!pdfDoc) {
    return NextResponse.json(
      { error: "Dokumen PDF tidak ditemukan di katalog." },
      { status: 404 }
    );
  }

  const upstreamHeaders = new Headers({
    "User-Agent": "Mozilla/5.0 (compatible; KhazanahBahtsulMasail/1.0)",
  });

  // Pass through HTTP Range header so browser streams PDF pages on-demand!
  const rangeHeader = req.headers.get("range");
  if (rangeHeader) {
    upstreamHeaders.set("Range", rangeHeader);
  }

  try {
    const upstream = await fetch(pdfDoc.url_pdf, {
      headers: upstreamHeaders,
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Sumber PDF merespons status ${upstream.status}.` },
        { status: 502 }
      );
    }

    const resHeaders = new Headers();
    resHeaders.set(
      "Content-Type",
      upstream.headers.get("content-type") || "application/pdf"
    );
    resHeaders.set("Content-Disposition", `inline; filename="${pdfDoc.id}.pdf"`);
    resHeaders.set(
      "Accept-Ranges",
      upstream.headers.get("accept-ranges") || "bytes"
    );
    resHeaders.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400"
    );

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) resHeaders.set("Content-Length", contentLength);

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) resHeaders.set("Content-Range", contentRange);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengalirkan dokumen PDF dari sumber online." },
      { status: 502 }
    );
  }
}
