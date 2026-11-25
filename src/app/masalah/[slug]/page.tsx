import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  ExternalLink,
  Landmark,
  Tag,
} from "lucide-react";
import {
  getMasailByPdfDocId,
  getMasailBySlug,
  getRelatedMasail,
} from "@/lib/catalog";
import { MasailViewerClient } from "@/components/MasailViewerClient";
import { MasailCard } from "@/components/MasailCard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getMasailBySlug(slug);
  if (!item) return { title: "Pembahasan Tidak Ditemukan" };
  return {
    title: item.judul,
    description: item.ringkasan_singkat,
  };
}

export default async function MasalahDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getMasailBySlug(slug);
  if (!item) notFound();

  const related = getRelatedMasail(item, 4);
  const siblingPdfMasail = item.pdf?.dokumen_pdf_id
    ? getMasailByPdfDocId(item.pdf.dokumen_pdf_id)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[#536058]">
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-medium text-[#0d6b47] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Beranda</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <Link
          href={`/?tabwib=${item.tabwib_kitab_id}`}
          className="hover:text-[#0d6b47] hover:underline"
        >
          {item.tabwib_kitab_nama}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        <Link
          href={`/?tabwib=${item.tabwib_id}`}
          className="font-semibold text-[#0d6b47] hover:underline"
        >
          {item.tabwib_id} · {item.tabwib_nama}
        </Link>
      </nav>

      {/* Metadata Header Card */}
      <header className="mb-6 rounded-2xl border border-[#e5dfd1] bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-[#e8f5ef] px-2.5 py-1 font-semibold text-[#0a5438]">
              Tabwib {item.tabwib_id} · {item.tabwib_nama}
            </span>
            <span className="rounded-md bg-[#fbf4e4] px-2.5 py-1 font-semibold capitalize text-[#8c6115]">
              Komisi {item.komisi === "waqiiyah" ? "Waqi'iyah" : item.komisi === "maudhuiyah" ? "Maudhu'iyah" : item.komisi === "qanuniyah" ? "Qanuniyah" : "Umum"}
            </span>
          </div>
          {item.tabwib_nama_ar ? (
            <span className="font-arabic text-lg text-[#b8862d]">
              {item.tabwib_nama_ar}
            </span>
          ) : null}
        </div>

        <h1 className="font-serif-title text-2xl font-bold leading-snug text-[#102a1f] sm:text-3xl">
          {item.judul}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[#425048]">
          {item.ringkasan_singkat}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ebe0] pt-4 text-xs text-[#536058]">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/?forum=${item.forum_id}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#1b241f] hover:text-[#0d6b47]"
            >
              <Landmark className="h-3.5 w-3.5 text-[#0d6b47]" />
              <span>{item.forum_nama}</span>
            </Link>
            {item.tahun ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#738077]" />
                <span>{item.tahun}</span>
              </span>
            ) : null}
          </div>

          {item.artikel?.url ? (
            <a
              href={item.artikel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0d6b47] hover:underline"
            >
              <span>Tautan Sumber Asli</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : item.pdf_dokumen ? (
            <a
              href={item.pdf_dokumen.url_halaman_sumber}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0d6b47] hover:underline"
            >
              <span>Arsip Internet Archive</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        {item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-[#8a948d]" />
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-[#faf8f3] px-2.5 py-0.5 text-[11px] text-[#536058] ring-1 ring-[#e5dfd1] transition hover:bg-[#e8f5ef] hover:text-[#0d6b47]"
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {/* Online Fatwa Reader &/or Online PDF Viewer */}
      <MasailViewerClient item={item} siblingPdfMasail={siblingPdfMasail} />

      {/* Related Masail in Same Bab */}
      {related.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif-title text-xl font-bold text-[#1b241f]">
              Pembahasan Terkait dalam Bab Ini
            </h2>
            <Link
              href={`/?tabwib=${item.tabwib_id}`}
              className="text-xs font-semibold text-[#0d6b47] hover:underline"
            >
              Lihat semua di {item.tabwib_nama} →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {related.map((rel) => (
              <MasailCard key={rel.id} item={rel} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
