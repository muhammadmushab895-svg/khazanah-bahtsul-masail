import { FileText } from "lucide-react";
import { getAllDokumenPdf } from "@/lib/catalog";
import { PustakaPdfExplorer } from "@/components/PustakaPdfExplorer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pustaka PDF Resmi Bahtsul Masail & Muktamar NU",
  description:
    "Kumpulan puluhan dokumen PDF online resmi keputusan Muktamar NU (1926–2026), Munas Alim Ulama, Konbes, Ahkamul Fuqaha, dan LBM PWNU/PCNU dengan filter langsung ke halaman masalah.",
};

export default function PustakaPdfPage() {
  const docs = getAllDokumenPdf();
  const totalIndexedInPdfs = docs.reduce((s, d) => s + d.masail_count, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="pattern-nusantara mb-8 rounded-2xl border border-[#0a5438]/20 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-[#f3d48c]">
              <FileText className="h-3.5 w-3.5" />
              <span>
                {docs.length} Arsip PDF Online (1926–2026) ·{" "}
                {totalIndexedInPdfs} Indeks Lompat Halaman
              </span>
            </span>
            <h1 className="font-serif-title mt-2 text-2xl font-bold sm:text-3xl">
              Pustaka PDF Keputusan Muktamar, Munas &amp; LBM NU
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-emerald-100/90">
              Seluruh dokumen PDF dialirkan secara online tanpa disimpan di
              perangkat Anda. Setiap PDF dilengkapi{" "}
              <strong>filter masalah di dalam dokumen</strong> agar Anda bisa
              langsung melompat ke halaman pembahasannya.
            </p>
          </div>
          <div className="font-arabic text-xl text-[#f0cc7e]">
            مكتبة المقررات الرسمية
          </div>
        </div>
      </div>

      <PustakaPdfExplorer docs={docs} />
    </div>
  );
}
