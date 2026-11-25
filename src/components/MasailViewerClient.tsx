"use client";

import { useState } from "react";
import { BookOpen, FileText } from "lucide-react";
import type { EnrichedMasailItem } from "@/types/catalog";
import { LiveFatwaReader } from "./LiveFatwaReader";
import { OnlinePdfViewer } from "./OnlinePdfViewer";

export function MasailViewerClient({
  item,
  siblingPdfMasail = [],
}: {
  item: EnrichedMasailItem;
  siblingPdfMasail?: EnrichedMasailItem[];
}) {
  const hasArtikel = Boolean(item.artikel?.url);
  const hasPdf = Boolean(item.pdf && item.pdf_dokumen);

  const [activeTab, setActiveTab] = useState<"artikel" | "pdf">(
    hasArtikel ? "artikel" : "pdf"
  );

  return (
    <div className="space-y-4">
      {hasArtikel && hasPdf ? (
        <div className="inline-flex rounded-xl border border-[#e5dfd1] bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("artikel")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === "artikel"
                ? "bg-[#0d6b47] text-white"
                : "text-[#536058] hover:text-[#1b241f]"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Tulisan Fatwa Online</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === "pdf"
                ? "bg-[#b8862d] text-white"
                : "text-[#536058] hover:text-[#1b241f]"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Dokumen PDF Resmi</span>
          </button>
        </div>
      ) : null}

      {activeTab === "artikel" && item.artikel?.url ? (
        <LiveFatwaReader
          masalahId={item.id}
          fallbackTitle={item.judul}
          fallbackSummary={item.ringkasan_singkat}
          sourceUrl={item.artikel.url}
          sourceName={item.artikel.nama_sumber}
        />
      ) : null}

      {activeTab === "pdf" && item.pdf && item.pdf_dokumen ? (
        <OnlinePdfViewer
          dokumen={item.pdf_dokumen}
          halamanMulai={item.pdf.halaman_mulai}
          halamanSelesai={item.pdf.halaman_selesai}
          masailInPdf={siblingPdfMasail}
          initialMasalahId={item.id}
        />
      ) : null}
    </div>
  );
}
