"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ExternalLink,
  FileText,
  ListFilter,
  Search,
} from "lucide-react";
import type { DokumenPdfItem } from "@/types/catalog";

interface EnrichedPdfDoc extends DokumenPdfItem {
  forum_nama: string;
  forum_tingkat: string;
  masail_count: number;
  sample_masail: {
    id: string;
    judul: string;
    halaman_mulai: number;
    tabwib_id: string;
  }[];
}

export function PustakaPdfExplorer({ docs }: { docs: EnrichedPdfDoc[] }) {
  const [query, setQuery] = useState("");
  const [eraFilter, setEraFilter] = useState<
    "all" | "terbaru" | "historis" | "daerah" | "berindeks"
  >("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (eraFilter === "terbaru" && (d.tahun ?? 0) < 2012) return false;
      if (
        eraFilter === "historis" &&
        ((d.tahun ?? 9999) > 2010 || d.forum_tingkat !== "pbnu")
      )
        return false;
      if (eraFilter === "daerah" && d.forum_tingkat === "pbnu") return false;
      if (eraFilter === "berindeks" && d.masail_count === 0) return false;

      if (q) {
        const sampleTitles = d.sample_masail.map((s) => s.judul).join(" ");
        const hay = `${d.judul} ${d.deskripsi ?? ""} ${d.forum_nama} ${d.tahun ?? ""} ${sampleTitles}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [docs, query, eraFilter]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-6 rounded-2xl border border-[#e5dfd1] bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#738077]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul PDF Muktamar, Munas, tahun, LBM daerah, atau topik masalah..."
              className="w-full rounded-xl border border-[#dfd8c8] bg-[#faf8f3] py-2.5 pl-10 pr-4 text-sm text-[#1b241f] placeholder:text-[#7e8a82] focus:border-[#0d6b47] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", label: `Semua (${docs.length})` },
                { id: "berindeks", label: "Ada Filter Masalah" },
                { id: "terbaru", label: "Terbaru (2012–2026)" },
                { id: "historis", label: "Historis (1926–2010)" },
                { id: "daerah", label: "LBM PWNU / PCNU" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setEraFilter(tab.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  eraFilter === tab.id
                    ? "bg-[#0d6b47] text-white"
                    : "bg-[#f2eee4] text-[#425048] hover:bg-[#e5dfd1]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-4 text-xs font-medium text-[#536058]">
        Menampilkan <strong className="text-[#1b241f]">{filtered.length}</strong>{" "}
        dari <strong className="text-[#1b241f]">{docs.length}</strong> dokumen
        PDF resmi online
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc) => (
          <article
            key={doc.id}
            className="group flex flex-col justify-between rounded-2xl border border-[#e5dfd1] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#b8862d]/60 hover:shadow-md"
          >
            <div>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-md border border-[#e5c98b] bg-[#fbf4e4] px-2 py-0.5 font-semibold text-[#8c6115]">
                  <FileText className="h-3 w-3" />
                  <span>{doc.sumber_label}</span>
                </span>
                <div className="flex items-center gap-2">
                  {doc.masail_count > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f5ef] px-2 py-0.5 font-bold text-[#0a5438]">
                      <ListFilter className="h-3 w-3" />
                      <span>{doc.masail_count} masalah</span>
                    </span>
                  ) : null}
                  {doc.tahun ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#536058]">
                      <Calendar className="h-3 w-3" />
                      {doc.tahun}
                    </span>
                  ) : null}
                </div>
              </div>

              <Link href={`/pdf/${doc.id}`} className="block">
                <h2 className="font-serif-title text-base font-bold leading-snug text-[#1b241f] group-hover:text-[#0d6b47]">
                  {doc.judul}
                </h2>
              </Link>

              {doc.judul_ar ? (
                <p className="font-arabic mt-1.5 text-sm text-[#8c6115]">
                  {doc.judul_ar}
                </p>
              ) : null}

              {doc.deskripsi ? (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#536058]">
                  {doc.deskripsi}
                </p>
              ) : null}

              {/* Quick direct-jump chips to sample issues inside this PDF */}
              {doc.sample_masail.length > 0 ? (
                <div className="mt-3 space-y-1 border-t border-[#f2eee4] pt-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#738077]">
                    Langsung ke masalah di PDF ini:
                  </div>
                  {doc.sample_masail.map((s) => (
                    <Link
                      key={s.id}
                      href={`/pdf/${doc.id}?page=${s.halaman_mulai}&masalah=${encodeURIComponent(s.id)}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[#faf8f3] px-2.5 py-1.5 text-[11px] text-[#2d3b33] transition hover:bg-[#e8f5ef] hover:text-[#0a5438]"
                    >
                      <span className="truncate">{s.judul}</span>
                      <span className="shrink-0 font-mono text-[10px] font-bold text-[#8c6115]">
                        Hal.{s.halaman_mulai}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#f0ebe0] pt-3 text-xs">
              <a
                href={doc.url_halaman_sumber}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#738077] hover:text-[#0d6b47]"
              >
                <span>Arsip Sumber</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <Link
                href={`/pdf/${doc.id}`}
                className="inline-flex items-center gap-1 font-semibold text-[#0d6b47] transition group-hover:gap-1.5"
              >
                <span>Buka PDF &amp; Filter</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
