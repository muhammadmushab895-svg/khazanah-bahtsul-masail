"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  ListFilter,
  Maximize2,
  Minimize2,
  Search,
  X,
} from "lucide-react";
import type { DokumenPdfItem, EnrichedMasailItem, KomisiType } from "@/types/catalog";

interface OnlinePdfViewerProps {
  dokumen: DokumenPdfItem;
  halamanMulai?: number;
  halamanSelesai?: number;
  masailInPdf?: EnrichedMasailItem[];
  initialMasalahId?: string;
}

const KOMISI_LABEL: Record<KomisiType, string> = {
  waqiiyah: "Waqi'iyah",
  maudhuiyah: "Maudhu'iyah",
  qanuniyah: "Qanuniyah",
  umum: "Umum",
};

export function OnlinePdfViewer({
  dokumen,
  halamanMulai = 1,
  halamanSelesai,
  masailInPdf = [],
  initialMasalahId,
}: OnlinePdfViewerProps) {
  const canUseArchiveStream = Boolean(
    dokumen.tipe_host === "archive_org" &&
      dokumen.archive_identifier &&
      dokumen.archive_identifier !== "bahtsul-masail"
  );

  const [viewerMode, setViewerMode] = useState<"native_stream" | "archive_embed">(
    canUseArchiveStream ? "archive_embed" : "native_stream"
  );

  const initialSelected = useMemo(() => {
    if (initialMasalahId) {
      return masailInPdf.find((m) => m.id === initialMasalahId) ?? null;
    }
    if (halamanMulai > 1) {
      return (
        masailInPdf.find((m) => m.pdf?.halaman_mulai === halamanMulai) ?? null
      );
    }
    return null;
  }, [initialMasalahId, halamanMulai, masailInPdf]);

  const [selectedMasalah, setSelectedMasalah] =
    useState<EnrichedMasailItem | null>(initialSelected);
  const [pageNum, setPageNum] = useState<number>(
    Math.max(1, initialSelected?.pdf?.halaman_mulai ?? halamanMulai)
  );
  const [expanded, setExpanded] = useState(false);

  // Per-PDF Masalah Filter state
  const [filterQuery, setFilterQuery] = useState("");
  const [filterKitab, setFilterKitab] = useState("");
  const [filterKomisi, setFilterKomisi] = useState<KomisiType | "">("");
  const [showMobileIndex, setShowMobileIndex] = useState(false);

  // Distinct Tabwib Kitabs & Komisi present inside THIS PDF
  const availableKitabs = useMemo(() => {
    const map = new Map<string, { id: string; nama: string; count: number }>();
    for (const m of masailInPdf) {
      const existing = map.get(m.tabwib_kitab_id);
      if (existing) existing.count += 1;
      else
        map.set(m.tabwib_kitab_id, {
          id: m.tabwib_kitab_id,
          nama: m.tabwib_kitab_nama.replace(/\s*\([^)]*\)/, ""),
          count: 1,
        });
    }
    return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
  }, [masailInPdf]);

  const availableKomisi = useMemo(() => {
    const set = new Set<KomisiType>();
    for (const m of masailInPdf) set.add(m.komisi);
    return [...set];
  }, [masailInPdf]);

  const filteredMasail = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return masailInPdf.filter((m) => {
      if (filterKitab && m.tabwib_kitab_id !== filterKitab) return false;
      if (filterKomisi && m.komisi !== filterKomisi) return false;
      if (q) {
        const hay = `${m.judul} ${m.ringkasan_singkat} ${m.tabwib_nama} ${m.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [masailInPdf, filterQuery, filterKitab, filterKomisi]);

  const jumpToMasalah = (m: EnrichedMasailItem) => {
    const targetPage = Math.max(1, m.pdf?.halaman_mulai ?? 1);
    setSelectedMasalah(m);
    setPageNum(targetPage);
    setShowMobileIndex(false);
  };

  const selectedIndex = selectedMasalah
    ? filteredMasail.findIndex((m) => m.id === selectedMasalah.id)
    : -1;

  const archivePageIndex = Math.max(0, pageNum - 1);
  const archiveEmbedUrl = dokumen.archive_identifier
    ? `https://archive.org/embed/${dokumen.archive_identifier}#page/n${archivePageIndex}/mode/1up`
    : "";

  const nativeProxyUrl = `/api/pdf-proxy?doc=${encodeURIComponent(dokumen.id)}#page=${pageNum}&view=FitH`;

  const hasIssueIndex = masailInPdf.length > 0;

  const renderIssueIndexPanel = () => (
    <div className="flex h-full flex-col bg-[#faf8f3]">
      {/* Panel Header */}
      <div className="border-b border-[#e5dfd1] bg-white px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ListFilter className="h-4 w-4 text-[#0d6b47]" />
            <h3 className="font-serif-title text-sm font-bold text-[#102a1f]">
              Filter Masalah di PDF Ini
            </h3>
          </div>
          <span className="rounded-full bg-[#e8f5ef] px-2 py-0.5 text-[11px] font-bold text-[#0a5438]">
            {filteredMasail.length}/{masailInPdf.length}
          </span>
        </div>

        {/* Search inside PDF */}
        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#738077]" />
          <input
            type="search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Cari masalah di dalam PDF ini..."
            className="w-full rounded-lg border border-[#dfd8c8] bg-[#faf8f3] py-1.5 pl-8 pr-3 text-xs text-[#1b241f] placeholder:text-[#86918a] focus:border-[#0d6b47] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Komisi filter FIRST when PDF has multiple commissions (matches official NU PDF structure!) */}
        {availableKomisi.length > 1 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Filter className="h-3 w-3 text-[#8a948d]" />
            <button
              type="button"
              onClick={() => setFilterKomisi("")}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                !filterKomisi
                  ? "bg-[#b8862d] text-white"
                  : "bg-white text-[#536058] ring-1 ring-[#e5dfd1] hover:bg-[#f2eee4]"
              }`}
            >
              Semua Komisi
            </button>
            {availableKomisi.map((kom) => (
              <button
                key={kom}
                type="button"
                onClick={() =>
                  setFilterKomisi((prev) => (prev === kom ? "" : kom))
                }
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                  filterKomisi === kom
                    ? "bg-[#b8862d] text-white"
                    : "bg-white text-[#536058] ring-1 ring-[#e5dfd1] hover:bg-[#f2eee4]"
                }`}
              >
                {KOMISI_LABEL[kom]}
              </button>
            ))}
          </div>
        ) : null}

        {/* Tabwib Kitab filter inside this PDF (only shown as compact select when multiple Babs exist) */}
        {availableKitabs.length > 1 ? (
          <div className="mt-2">
            <select
              aria-label="Filter Bab Fikih dalam PDF ini"
              value={filterKitab}
              onChange={(e) => setFilterKitab(e.target.value)}
              className="w-full rounded-lg border border-[#dfd8c8] bg-[#faf8f3] px-2.5 py-1.5 text-[11px] font-medium text-[#1b241f] focus:border-[#0d6b47] focus:bg-white focus:outline-none"
            >
              <option value="">
                Semua Bab Tabwib ({masailInPdf.length} masalah)
              </option>
              {availableKitabs.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.id}. {k.nama} ({k.count})
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {/* Scrollable Jump List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {filteredMasail.length > 0 ? (
          filteredMasail.map((m) => {
            const isActive = selectedMasalah?.id === m.id;
            const hal = m.pdf?.halaman_mulai ?? 1;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => jumpToMasalah(m)}
                className={`w-full rounded-xl border p-2.5 text-left transition ${
                  isActive
                    ? "border-[#0d6b47] bg-[#e8f5ef] shadow-xs"
                    : "border-[#e7e1d4] bg-white hover:border-[#0d6b47]/40 hover:bg-[#f8f5ee]"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-1.5 text-[10px]">
                  <span className="truncate font-semibold text-[#0d6b47]">
                    {KOMISI_LABEL[m.komisi]} · {m.tabwib_id}
                  </span>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 font-bold ${
                      isActive
                        ? "bg-[#0d6b47] text-white"
                        : "bg-[#fbf4e4] text-[#8c6115] ring-1 ring-[#e5c98b]"
                    }`}
                  >
                    Hal. {hal}
                  </span>
                </div>
                <div className="text-xs font-semibold leading-snug text-[#1b241f]">
                  {m.judul}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-[#738077]">
                  {m.tabwib_nama}
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-[#d9d1c0] bg-white p-4 text-center text-xs text-[#536058]">
            Tidak ada masalah yang cocok dengan filter tersebut.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#e5dfd1] bg-white shadow-sm ${
        expanded ? "fixed inset-3 z-50 flex flex-col" : ""
      }`}
    >
      {/* PDF Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ece6d9] bg-[#f8f5ee] px-4 py-3 text-xs text-[#425048]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b8862d] px-2.5 py-1 text-[11px] font-semibold text-white">
            <FileText className="h-3 w-3" />
            <span>PDF Online · {dokumen.sumber_label}</span>
          </span>

          {hasIssueIndex ? (
            <button
              type="button"
              onClick={() => setShowMobileIndex((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-[#0d6b47] px-2.5 py-1 text-[11px] font-semibold text-white lg:hidden"
            >
              <ListFilter className="h-3 w-3" />
              <span>Daftar Masalah ({masailInPdf.length})</span>
            </button>
          ) : null}

          {halamanSelesai ? (
            <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-[#536058] ring-1 ring-[#e5dfd1]">
              Rujukan Hal. {halamanMulai}–{halamanSelesai}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {canUseArchiveStream ? (
            <div className="inline-flex rounded-lg border border-[#dfd8c8] bg-white p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setViewerMode("archive_embed")}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition ${
                  viewerMode === "archive_embed"
                    ? "bg-[#0d6b47] text-white"
                    : "text-[#536058] hover:text-[#1b241f]"
                }`}
              >
                <BookOpen className="h-3 w-3" />
                <span>Stream Ringan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewerMode("native_stream")}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition ${
                  viewerMode === "native_stream"
                    ? "bg-[#0d6b47] text-white"
                    : "text-[#536058] hover:text-[#1b241f]"
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>PDF Langsung</span>
              </button>
            </div>
          ) : null}

          {/* Manual Jump Page */}
          <label className="inline-flex items-center gap-1 rounded-lg border border-[#dfd8c8] bg-white px-2 py-1 text-[11px]">
            <span className="text-[#738077]">Hal.</span>
            <input
              type="number"
              min={1}
              value={pageNum}
              onChange={(e) =>
                setPageNum(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-12 bg-transparent font-semibold text-[#1b241f] focus:outline-none"
            />
          </label>

          {/* Expand / Fullscreen */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#dfd8c8] bg-white px-2.5 py-1.5 font-medium hover:bg-[#f2eee4]"
            title={expanded ? "Kecilkan tampilan" : "Perluas tampilan PDF"}
          >
            {expanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Direct Original PDF Link */}
          <a
            href={dokumen.url_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-[#0d6b47] px-2.5 py-1.5 font-semibold text-white hover:bg-[#094f34]"
          >
            <span>Buka PDF Asli</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Active Selected Masalah Strip */}
      {selectedMasalah ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d5e7de] bg-[#eef7f2] px-4 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <span className="mr-2 rounded bg-[#0d6b47] px-1.5 py-0.5 text-[10px] font-bold text-white">
              Hal. {pageNum}
            </span>
            <span className="font-semibold text-[#102a1f]">
              {selectedMasalah.judul}
            </span>
          </div>
          {filteredMasail.length > 1 && selectedIndex >= 0 ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                disabled={selectedIndex <= 0}
                onClick={() => jumpToMasalah(filteredMasail[selectedIndex - 1])}
                className="inline-flex items-center gap-0.5 rounded-md border border-[#c7ded3] bg-white px-2 py-1 text-[11px] font-semibold text-[#0d6b47] disabled:opacity-40 hover:bg-[#e8f5ef]"
              >
                <ChevronLeft className="h-3 w-3" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={selectedIndex >= filteredMasail.length - 1}
                onClick={() => jumpToMasalah(filteredMasail[selectedIndex + 1])}
                className="inline-flex items-center gap-0.5 rounded-md border border-[#c7ded3] bg-white px-2 py-1 text-[11px] font-semibold text-[#0d6b47] disabled:opacity-40 hover:bg-[#e8f5ef]"
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Main Viewer Body: Optional Per-PDF Masalah Filter Sidebar + Online PDF Frame */}
      <div
        className={`grid grid-cols-1 ${
          hasIssueIndex ? "lg:grid-cols-12" : ""
        } ${expanded ? "min-h-0 flex-1" : "h-[78vh] min-h-[560px]"}`}
      >
        {hasIssueIndex ? (
          <aside className="hidden overflow-hidden border-r border-[#e5dfd1] lg:col-span-4 lg:block xl:col-span-3">
            {renderIssueIndexPanel()}
          </aside>
        ) : null}

        <div
          className={`relative h-full w-full bg-[#242926] ${
            hasIssueIndex ? "lg:col-span-8 xl:col-span-9" : ""
          }`}
        >
          {viewerMode === "archive_embed" && archiveEmbedUrl ? (
            <iframe
              key={`archive-${dokumen.id}-${pageNum}`}
              src={archiveEmbedUrl}
              title={dokumen.judul}
              className="h-full w-full border-0"
              allowFullScreen
            />
          ) : (
            <iframe
              key={`native-${dokumen.id}-${pageNum}`}
              src={nativeProxyUrl}
              title={dokumen.judul}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>

      {/* Mobile Per-PDF Masalah Drawer */}
      {hasIssueIndex && showMobileIndex ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/45"
            onClick={() => setShowMobileIndex(false)}
          />
          <div className="relative z-10 flex h-full w-80 max-w-[88vw] flex-col bg-[#faf8f3] shadow-xl">
            <div className="flex items-center justify-between bg-[#0d6b47] px-4 py-3 text-white">
              <span className="font-serif-title text-sm font-bold">
                Daftar Masalah di PDF Ini
              </span>
              <button
                type="button"
                onClick={() => setShowMobileIndex(false)}
                className="rounded-lg p-1 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{renderIssueIndexPanel()}</div>
          </div>
        </div>
      ) : null}

      {/* Footer note */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ece6d9] bg-[#faf8f3] px-4 py-2.5 text-[11px] text-[#536058]">
        <span>
          Dokumen dialirkan secara <strong>online (streaming)</strong> tanpa
          disimpan di perangkat Anda.{" "}
          {hasIssueIndex
            ? "Pilih masalah di panel kiri untuk langsung melompat ke halaman pembahasannya."
            : "Gunakan kolom Hal. untuk melompat cepat ke halaman tertentu."}
        </span>
        <a
          href={dokumen.url_halaman_sumber}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#0d6b47] hover:underline"
        >
          Arsip Sumber →
        </a>
      </div>
    </div>
  );
}
