import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, Landmark, ListFilter } from "lucide-react";
import {
  getDokumenPdfById,
  getForumById,
  getMasailByPdfDocId,
} from "@/lib/catalog";
import { OnlinePdfViewer } from "@/components/OnlinePdfViewer";
import type { Metadata } from "next";

interface PdfPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; masalah?: string }>;
}

export async function generateMetadata({
  params,
}: PdfPageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = getDokumenPdfById(id);
  if (!doc) return { title: "Dokumen PDF Tidak Ditemukan" };
  return {
    title: doc.judul,
    description: doc.deskripsi || `Baca online ${doc.judul}`,
  };
}

export default async function PdfViewerPage({
  params,
  searchParams,
}: PdfPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const doc = getDokumenPdfById(id);
  if (!doc) notFound();

  const forum = getForumById(doc.forum_id);
  const masailInPdf = getMasailByPdfDocId(doc.id);
  const startPage = Math.max(1, Number(sp.page || "1") || 1);
  const initialMasalahId = sp.masalah?.trim() || undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <Link
          href="/pustaka-pdf"
          className="inline-flex items-center gap-1 font-semibold text-[#0d6b47] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Pustaka PDF</span>
        </Link>

        <a
          href={doc.url_halaman_sumber}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-[#536058] hover:text-[#0d6b47]"
        >
          <span>Halaman Arsip Asli</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <header className="mb-5 rounded-2xl border border-[#e5dfd1] bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-serif-title text-xl font-bold text-[#102a1f] sm:text-2xl">
            {doc.judul}
          </h1>
          {doc.judul_ar ? (
            <span className="font-arabic text-lg text-[#b8862d]">
              {doc.judul_ar}
            </span>
          ) : null}
        </div>

        {doc.deskripsi ? (
          <p className="mt-2 text-sm text-[#536058]">{doc.deskripsi}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#536058]">
          {forum ? (
            <Link
              href={`/?forum=${forum.id}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#0d6b47] hover:underline"
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>{forum.nama}</span>
            </Link>
          ) : null}
          {doc.tahun ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Tahun {doc.tahun}</span>
            </span>
          ) : null}
          {masailInPdf.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5ef] px-2.5 py-0.5 font-semibold text-[#0a5438]">
              <ListFilter className="h-3 w-3" />
              <span>
                {masailInPdf.length} masalah terindeks siap lompat halaman
              </span>
            </span>
          ) : null}
        </div>
      </header>

      <OnlinePdfViewer
        dokumen={doc}
        halamanMulai={startPage}
        masailInPdf={masailInPdf}
        initialMasalahId={initialMasalahId}
      />
    </div>
  );
}
