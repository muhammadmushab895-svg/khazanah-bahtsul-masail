import Link from "next/link";
import { ArrowRight, Calendar, ExternalLink, Landmark, MapPin } from "lucide-react";
import { getAllForums } from "@/lib/catalog";
import type { ForumTingkat } from "@/types/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forum, Muktamar & Lembaga Bahtsul Masail",
  description:
    "Jelajahi keputusan Bahtsul Masail berdasarkan forum penyelenggara: Munas & Muktamar PBNU, PCNU, Ma'had Aly Lirboyo, PP. Sidogiri, NU Online, dan PISS-KTB.",
};

const TINGKAT_LABEL: Record<ForumTingkat, string> = {
  pbnu: "Tingkat Pusat (PBNU)",
  pwnu: "Tingkat Wilayah (PWNU)",
  pcnu: "Tingkat Cabang (PCNU)",
  fmpp: "Forum Pesantren (FMPP)",
  mahad_aly: "Ma'had Aly",
  pesantren: "Pondok Pesantren",
  komunitas: "Komunitas Aswaja",
};

export default function ForumPage() {
  const forums = getAllForums();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-2xl border border-[#e5dfd1] bg-white p-6 shadow-xs sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5ef] px-3 py-1 text-[11px] font-semibold text-[#0d6b47]">
          <Landmark className="h-3.5 w-3.5" />
          <span>Jelajah Berdasarkan Forum &amp; Sumber</span>
        </span>
        <h1 className="font-serif-title mt-2 text-2xl font-bold text-[#102a1f] sm:text-3xl">
          Daftar Forum Muktamar, Munas &amp; Lembaga Bahtsul Masail
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[#536058]">
          Selain menjelajah berdasarkan <strong>Tabwib Fikih</strong>, Anda bisa
          memilih forum atau lembaga tertentu untuk melihat seluruh pembahasan
          dan dokumen PDF yang terindeks darinya.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forums.map((f) => (
          <article
            key={f.id}
            className="flex flex-col justify-between rounded-2xl border border-[#e5dfd1] bg-white p-5 shadow-xs transition hover:border-[#0d6b47]/40 hover:shadow-md"
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="rounded-md bg-[#f2eee4] px-2 py-0.5 font-semibold text-[#0d6b47]">
                  {TINGKAT_LABEL[f.tingkat]}
                </span>
                <span className="rounded-full bg-[#e8f5ef] px-2.5 py-0.5 font-bold text-[#0a5438]">
                  {f.count} terindeks
                </span>
              </div>

              <h2 className="font-serif-title text-lg font-bold text-[#1b241f]">
                {f.nama}
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#738077]">
                {f.tahun ? (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {f.tahun}
                  </span>
                ) : null}
                {f.lokasi ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {f.lokasi}
                  </span>
                ) : null}
              </div>

              {f.deskripsi ? (
                <p className="mt-2.5 text-xs leading-relaxed text-[#536058]">
                  {f.deskripsi}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#f0ebe0] pt-3 text-xs">
              {f.situs_sumber ? (
                <a
                  href={f.situs_sumber}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#738077] hover:text-[#0d6b47]"
                >
                  <span>Situs Asli</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span />
              )}

              <Link
                href={`/?forum=${f.id}`}
                className="inline-flex items-center gap-1 font-semibold text-[#0d6b47] hover:underline"
              >
                <span>Lihat Pembahasan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
