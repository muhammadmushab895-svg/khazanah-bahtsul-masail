"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Globe,
  Moon,
  RefreshCw,
  Sun,
  Type,
} from "lucide-react";
import type { ReaderArticleResponse } from "@/types/catalog";

interface LiveFatwaReaderProps {
  masalahId: string;
  fallbackTitle: string;
  fallbackSummary: string;
  sourceUrl: string;
  sourceName: string;
}

export function LiveFatwaReader({
  masalahId,
  fallbackTitle,
  fallbackSummary,
  sourceUrl,
  sourceName,
}: LiveFatwaReaderProps) {
  const [data, setData] = useState<ReaderArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<number>(16);
  const [darkMode, setDarkMode] = useState(false);

  const loadLiveArticle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reader?id=${encodeURIComponent(masalahId)}`
      );
      const json = (await res.json()) as ReaderArticleResponse;
      setData(json);
    } catch {
      setData({
        ok: false,
        source_mode: "fallback",
        masalah_id: masalahId,
        title: fallbackTitle,
        source_name: sourceName,
        source_url: sourceUrl,
        fetched_at: new Date().toISOString(),
        error_reason: "Koneksi gagal saat mengambil tulisan online.",
      });
    } finally {
      setLoading(false);
    }
  }, [masalahId, fallbackTitle, sourceName, sourceUrl]);

  useEffect(() => {
    loadLiveArticle();
  }, [loadLiveArticle]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#e5dfd1] bg-white shadow-sm transition-colors ${
        darkMode ? "reader-dark" : ""
      }`}
    >
      {/* Reader Control Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-xs ${
          darkMode
            ? "border-[#26352d] bg-[#101814] text-emerald-100"
            : "border-[#ece6d9] bg-[#f8f5ee] text-[#425048]"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6b47] px-2.5 py-1 text-[11px] font-semibold text-white">
            <Globe className="h-3 w-3" />
            <span>Akses Langsung Online · {sourceName}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Font size */}
          <div className="inline-flex items-center rounded-lg border border-current/15 bg-black/5 px-1">
            <Type className="ml-1.5 h-3.5 w-3.5 opacity-60" />
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="px-2 py-1 font-bold hover:text-[#0d6b47]"
              title="Perkecil huruf"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(24, s + 2))}
              className="px-2 py-1 font-bold hover:text-[#0d6b47]"
              title="Perbesar huruf"
            >
              A+
            </button>
          </div>

          {/* Dark reading mode */}
          <button
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-current/15 px-2.5 py-1.5 font-medium hover:bg-black/5"
            title="Ubah mode baca terang/malam"
          >
            {darkMode ? (
              <>
                <Sun className="h-3.5 w-3.5 text-[#f0cc7e]" />
                <span className="hidden sm:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Malam</span>
              </>
            )}
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={loadLiveArticle}
            className="inline-flex items-center gap-1 rounded-lg border border-current/15 px-2.5 py-1.5 font-medium hover:bg-black/5"
            title="Muat ulang langsung dari situs sumber"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Open Original */}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-[#0d6b47] px-2.5 py-1.5 font-semibold text-white hover:bg-[#094f34]"
          >
            <span>Sumber Asli</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Reader Body */}
      <div className="p-5 sm:p-8">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-5 w-3/4 rounded bg-[#e8e3d7]" />
            <div className="h-4 w-full rounded bg-[#efeae0]" />
            <div className="h-4 w-11/12 rounded bg-[#efeae0]" />
            <div className="h-24 w-full rounded-xl bg-[#e8f5ef]" />
            <div className="h-4 w-5/6 rounded bg-[#efeae0]" />
            <div className="h-4 w-4/5 rounded bg-[#efeae0]" />
            <p className="pt-2 text-xs text-[#738077]">
              Mengambil tulisan fatwa langsung secara online dari {sourceName}...
            </p>
          </div>
        ) : data?.ok && data.content_html ? (
          <>
            {data.published_date || data.author ? (
              <div className="mb-5 flex flex-wrap items-center gap-3 text-xs opacity-75">
                {data.published_date ? (
                  <span>Terbit: {data.published_date}</span>
                ) : null}
                {data.author ? <span>Penulis/Redaksi: {data.author}</span> : null}
              </div>
            ) : null}

            <div
              className="fatwa-reader-content"
              style={{ fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: data.content_html }}
            />

            <div
              className={`mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-xs ${
                darkMode
                  ? "border-[#293a31] bg-[#19241e] text-emerald-100/80"
                  : "border-[#e5dfd1] bg-[#faf8f3] text-[#536058]"
              }`}
            >
              <div>
                <strong>Transparansi Sumber Online:</strong> Tulisan ini dimuat
                langsung secara real-time dari{" "}
                <strong className="text-[#0d6b47]">{sourceName}</strong> tanpa
                disimpan permanen di perangkat Anda.
              </div>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#0d6b47] hover:underline"
              >
                <span>Buka Halaman Asli</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-700" />
            <h3 className="font-serif-title mt-3 text-lg font-bold text-[#1b241f]">
              Situs Sumber Perlu Dibuka Langsung
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-[#536058]">
              {data?.error_reason ||
                "Halaman sumber tidak mengizinkan pembacaan otomatis saat ini."}
            </p>
            <p className="mx-auto mt-3 max-w-lg rounded-lg bg-white p-3 text-xs text-[#425048] ring-1 ring-amber-200/80">
              {fallbackSummary}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0d6b47] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#094f34]"
              >
                <span>Baca Langsung di {sourceName}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={loadLiveArticle}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfd8c8] bg-white px-4 py-2.5 text-xs font-semibold text-[#1b241f] hover:bg-[#f2eee4]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Coba Muat Ulang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
