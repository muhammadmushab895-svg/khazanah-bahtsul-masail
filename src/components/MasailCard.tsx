import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, FileText, Globe } from "lucide-react";
import type { EnrichedMasailItem, KomisiType } from "@/types/catalog";

const KOMISI_STYLE: Record<KomisiType, { label: string; cls: string }> = {
  waqiiyah: {
    label: "Waqi'iyah",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  maudhuiyah: {
    label: "Maudhu'iyah",
    cls: "bg-sky-50 text-sky-800 border-sky-200",
  },
  qanuniyah: {
    label: "Qanuniyah",
    cls: "bg-amber-50 text-amber-900 border-amber-200",
  },
  umum: {
    label: "Kompilasi / Umum",
    cls: "bg-stone-100 text-stone-700 border-stone-200",
  },
};

export function MasailCard({ item }: { item: EnrichedMasailItem }) {
  const komisi = KOMISI_STYLE[item.komisi] ?? KOMISI_STYLE.umum;
  const isPdf = item.tipe_akses === "pdf";
  const isBoth = item.tipe_akses === "keduanya";

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#e5dfd1] bg-white p-5 shadow-[0_1px_2px_rgba(16,38,28,0.04)] transition hover:-translate-y-0.5 hover:border-[#0d6b47]/40 hover:shadow-md">
      <div>
        {/* Top Metadata Row */}
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#f2eee4] px-2 py-0.5 font-semibold text-[#0d6b47]">
            <span>{item.tabwib_id}</span>
            <span>·</span>
            <span className="max-w-[175px] truncate">{item.tabwib_nama}</span>
          </span>

          <span
            className={`rounded-md border px-2 py-0.5 font-medium ${komisi.cls}`}
          >
            {komisi.label}
          </span>

          {isPdf || isBoth ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-[#e5c98b] bg-[#fbf4e4] px-2 py-0.5 font-semibold text-[#8c6115]">
              <FileText className="h-3 w-3" />
              <span>PDF Online</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-[#e8f5ef] px-2 py-0.5 font-semibold text-[#0a5438]">
              <Globe className="h-3 w-3" />
              <span>Tulisan Online</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/masalah/${item.slug}`} className="block">
          <h3 className="font-serif-title text-[17px] font-bold leading-snug text-[#1b241f] transition group-hover:text-[#0d6b47]">
            {item.judul}
          </h3>
        </Link>

        {/* Short Summary */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#536058]">
          {item.ringkasan_singkat}
        </p>

        {/* Tags */}
        {item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#faf8f3] px-2 py-0.5 text-[11px] text-[#66736b] ring-1 ring-[#e5dfd1]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0ebe0] pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#536058]">
          <span className="font-semibold text-[#2b3a32]">
            {item.forum_singkatan}
          </span>
          {item.tahun ? (
            <span className="inline-flex items-center gap-1 text-[#738077]">
              <Calendar className="h-3 w-3" />
              {item.tahun}
            </span>
          ) : null}
        </div>

        <Link
          href={`/masalah/${item.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-[#0d6b47] transition group-hover:gap-1.5"
        >
          {isPdf ? (
            <>
              <FileText className="h-3.5 w-3.5" />
              <span>Buka PDF</span>
            </>
          ) : (
            <>
              <BookOpen className="h-3.5 w-3.5" />
              <span>Baca Online</span>
            </>
          )}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
