export type KomisiType = "waqiiyah" | "maudhuiyah" | "qanuniyah" | "umum";

export type ForumTingkat =
  | "pbnu"
  | "pwnu"
  | "pcnu"
  | "fmpp"
  | "mahad_aly"
  | "pesantren"
  | "komunitas";

export type TipeAkses = "pdf" | "artikel" | "keduanya";

export interface TabwibItem {
  id: string;
  parent_id: string | null;
  level: 1 | 2 | 3;
  kode: string;
  nama_id: string;
  nama_ar: string;
  slug: string;
  deskripsi?: string;
}

export interface TabwibNode extends TabwibItem {
  count: number;
  children: TabwibNode[];
}

export interface ForumItem {
  id: string;
  nama: string;
  singkatan: string;
  tingkat: ForumTingkat;
  tahun: number | null;
  lokasi?: string;
  penyelenggara: string;
  situs_sumber?: string;
  deskripsi?: string;
}

export type PdfHostType = "archive_org" | "direct_pdf" | "gdrive";

export interface DokumenPdfItem {
  id: string;
  forum_id: string;
  judul: string;
  judul_ar?: string;
  url_pdf: string;
  url_halaman_sumber: string;
  tipe_host: PdfHostType;
  archive_identifier?: string;
  total_halaman?: number;
  sumber_label: string;
  tahun?: number;
  deskripsi?: string;
}

export interface MasailPdfRef {
  dokumen_pdf_id: string;
  halaman_mulai: number;
  halaman_selesai?: number;
}

export interface MasailArtikelRef {
  url: string;
  nama_sumber: string;
  tanggal_terbit?: string;
}

export interface MasailItem {
  id: string;
  slug: string;
  judul: string;
  tabwib_id: string;
  tabwib_sekunder?: string[];
  forum_id: string;
  tahun?: number;
  komisi: KomisiType;
  ringkasan_singkat: string;
  tags: string[];
  tipe_akses: TipeAkses;
  pdf?: MasailPdfRef;
  artikel?: MasailArtikelRef;
  url_video_kajian?: string | null;
}

export interface EnrichedMasailItem extends MasailItem {
  tabwib_nama: string;
  tabwib_nama_ar: string;
  tabwib_kitab_id: string;
  tabwib_kitab_nama: string;
  forum_nama: string;
  forum_singkatan: string;
  forum_tingkat: ForumTingkat;
  pdf_dokumen?: DokumenPdfItem;
}

export interface ReaderArticleResponse {
  ok: boolean;
  source_mode: "live_reader" | "fallback";
  masalah_id: string;
  title: string;
  source_name: string;
  source_url: string;
  published_date?: string;
  author?: string;
  content_html?: string;
  excerpt?: string;
  fetched_at: string;
  error_reason?: string;
}
