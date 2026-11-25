import Link from "next/link";
import { BookOpen, Cloud, FileText, Layers } from "lucide-react";
import {
  getAllForums,
  getCatalogStats,
  getTabwibById,
  getTabwibBySlug,
  getTabwibTree,
  queryMasail,
} from "@/lib/catalog";
import { TabwibExplorer } from "@/components/TabwibExplorer";
import type { KomisiType, TipeAkses } from "@/types/catalog";

interface HomePageProps {
  searchParams: Promise<{
    tabwib?: string;
    forum?: string;
    komisi?: string;
    tipe?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const tabwib = sp.tabwib?.trim() || "";
  const forum = sp.forum?.trim() || "";
  const komisi = (sp.komisi?.trim() || "") as KomisiType | "";
  const tipe = (sp.tipe?.trim() || "") as TipeAkses | "";
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page || "1") || 1);

  const tree = getTabwibTree();
  const forums = getAllForums();
  const stats = getCatalogStats();
  const { items, pagination } = queryMasail({
    tabwib,
    forum,
    komisi,
    tipe,
    q,
    page,
    limit: 16,
  });

  const activeTabwibMeta = tabwib
    ? getTabwibById(tabwib) ?? getTabwibBySlug(tabwib) ?? null
    : null;

  return (
    <div>
      {/* Scholarly Nusantara Hero Header */}
      <section className="pattern-nusantara border-b border-[#0a5438]/20 bg-gradient-to-br from-[#0d6b47] via-[#0b5e3f] to-[#08452e] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#f3d48c] ring-1 ring-[#d4a243]/35">
                <Cloud className="h-3.5 w-3.5" />
                <span>PWA Full Online · Indeks Ringan &amp; Tabwib Rapi</span>
              </div>
              <h1 className="font-serif-title text-2xl font-bold tracking-tight text-white sm:text-4xl">
                Khazanah Bahtsul Masail NU &amp; Pesantren
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/90 sm:text-base">
                Jelajahi keputusan <strong>Muktamar &amp; Munas NU</strong>,{" "}
                <strong>NU Online</strong>, <strong>Ma&apos;had Aly Lirboyo</strong>,{" "}
                <strong>PP. Sidogiri</strong>, dan <strong>PISS-KTB</strong>{" "}
                dalam satu katalog bertabwib rapi — baca tulisan fatwa dan
                dokumen PDF langsung secara online tanpa memberatkan perangkat.
              </p>
            </div>

            {/* Compact Live Catalog Stats */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:shrink-0">
              <div className="rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-xs ring-1 ring-white/15">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100/80">
                  <Layers className="h-3.5 w-3.5 text-[#f0cc7e]" />
                  <span>Tabwib</span>
                </div>
                <div className="mt-0.5 text-lg font-bold text-white">
                  {stats.totalKitabTabwib} Kitab
                </div>
                <div className="text-[10px] text-emerald-100/75">
                  {stats.totalBabTabwib} Bab Fikih
                </div>
              </div>

              <div className="rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-xs ring-1 ring-white/15">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100/80">
                  <BookOpen className="h-3.5 w-3.5 text-[#f0cc7e]" />
                  <span>Indeks</span>
                </div>
                <div className="mt-0.5 text-lg font-bold text-white">
                  {stats.totalMasail} Isu
                </div>
                <div className="text-[10px] text-emerald-100/75">
                  Siap Baca Online
                </div>
              </div>

              <Link
                href="/pustaka-pdf"
                className="rounded-xl bg-[#d4a243]/20 px-3.5 py-2.5 backdrop-blur-xs ring-1 ring-[#d4a243]/50 transition hover:bg-[#d4a243]/30"
              >
                <div className="flex items-center gap-1.5 text-[11px] text-[#f7dca0]">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Arsip PDF</span>
                </div>
                <div className="mt-0.5 text-lg font-bold text-white">
                  {stats.totalPdfDocs} PDF
                </div>
                <div className="text-[10px] text-[#f7dca0]/90">
                  1926 – 2026 →
                </div>
              </Link>
            </div>
          </div>

          {/* 7 Kitab Quick Jump Chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {tree.map((kitab) => {
              const active = tabwib === kitab.id || tabwib.startsWith(`${kitab.id}.`);
              return (
                <Link
                  key={kitab.id}
                  href={`/?tabwib=${kitab.id}`}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition ${
                    active
                      ? "bg-[#faf8f3] font-bold text-[#094f34] shadow-sm"
                      : "bg-white/10 text-emerald-50 ring-1 ring-white/15 hover:bg-white/20"
                  }`}
                >
                  <span className="mr-1.5 font-mono text-[10px] opacity-75">
                    {kitab.kode}
                  </span>
                  <span>{kitab.nama_id.replace(/\s*\([^)]*\)/, "")}</span>
                  <span className="ml-1.5 rounded-full bg-black/15 px-1.5 py-0.5 text-[10px]">
                    {kitab.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Tabwib Explorer */}
      <TabwibExplorer
        tree={tree}
        forums={forums}
        items={items}
        pagination={pagination}
        activeFilters={{ tabwib, forum, komisi, tipe, q }}
        activeTabwibMeta={activeTabwibMeta}
        totalPdfDocs={stats.totalPdfDocs}
      />
    </div>
  );
}
