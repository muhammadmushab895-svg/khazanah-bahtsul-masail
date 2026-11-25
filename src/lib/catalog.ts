import tabwibRaw from "@/data/tabwib.json";
import forumsRaw from "@/data/forums.json";
import dokumenPdfRaw from "@/data/dokumen-pdf.json";
import masail01 from "@/data/masail/01-ibadat.json";
import masail02 from "@/data/masail/02-muamalat.json";
import masail03 from "@/data/masail/03-munakahat.json";
import masail04 from "@/data/masail/04-jinayat.json";
import masail05 from "@/data/masail/05-siyasah-qanuniyah.json";
import masail06 from "@/data/masail/06-aqidah-akhlaq.json";
import masail07 from "@/data/masail/07-muashirah.json";
import type {
  DokumenPdfItem,
  EnrichedMasailItem,
  ForumItem,
  KomisiType,
  MasailItem,
  TabwibItem,
  TabwibNode,
  TipeAkses,
} from "@/types/catalog";

const tabwibList = tabwibRaw as TabwibItem[];
const forumsList = forumsRaw as ForumItem[];
const dokumenPdfList = dokumenPdfRaw as DokumenPdfItem[];
const rawMasailList: MasailItem[] = [
  ...(masail01 as MasailItem[]),
  ...(masail02 as MasailItem[]),
  ...(masail03 as MasailItem[]),
  ...(masail04 as MasailItem[]),
  ...(masail05 as MasailItem[]),
  ...(masail06 as MasailItem[]),
  ...(masail07 as MasailItem[]),
];

// O(1) indexed maps (react-best-practices: js-index-maps)
const tabwibById = new Map<string, TabwibItem>();
const tabwibBySlug = new Map<string, TabwibItem>();
for (const item of tabwibList) {
  tabwibById.set(item.id, item);
  tabwibBySlug.set(item.slug, item);
}

const forumById = new Map<string, ForumItem>();
for (const f of forumsList) {
  forumById.set(f.id, f);
}

const pdfById = new Map<string, DokumenPdfItem>();
for (const d of dokumenPdfList) {
  pdfById.set(d.id, d);
}

function getRootTabwib(tabwibId: string): TabwibItem | undefined {
  let curr = tabwibById.get(tabwibId);
  while (curr && curr.parent_id) {
    const parent = tabwibById.get(curr.parent_id);
    if (!parent) break;
    curr = parent;
  }
  return curr;
}

const enrichedMasail: EnrichedMasailItem[] = rawMasailList.map((m) => {
  const tw = tabwibById.get(m.tabwib_id);
  const rootTw = getRootTabwib(m.tabwib_id);
  const forum = forumById.get(m.forum_id);
  const pdfDoc = m.pdf ? pdfById.get(m.pdf.dokumen_pdf_id) : undefined;

  return {
    ...m,
    tabwib_nama: tw?.nama_id ?? m.tabwib_id,
    tabwib_nama_ar: tw?.nama_ar ?? "",
    tabwib_kitab_id: rootTw?.id ?? m.tabwib_id.slice(0, 2),
    tabwib_kitab_nama: rootTw?.nama_id ?? "Umum",
    forum_nama: forum?.nama ?? m.forum_id,
    forum_singkatan: forum?.singkatan ?? m.forum_id,
    forum_tingkat: forum?.tingkat ?? "pbnu",
    pdf_dokumen: pdfDoc,
  };
});

const masailBySlug = new Map<string, EnrichedMasailItem>();
const masailById = new Map<string, EnrichedMasailItem>();
for (const m of enrichedMasail) {
  masailBySlug.set(m.slug, m);
  masailById.set(m.id, m);
}

export function getAllTabwib(): TabwibItem[] {
  return tabwibList;
}

export function getTabwibById(id: string): TabwibItem | undefined {
  return tabwibById.get(id);
}

export function getTabwibBySlug(slug: string): TabwibItem | undefined {
  return tabwibBySlug.get(slug);
}

export function getTabwibTree(): TabwibNode[] {
  // Count masail per tabwib (including secondary tabwib)
  const directCounts = new Map<string, number>();
  const addCount = (id: string) => {
    directCounts.set(id, (directCounts.get(id) ?? 0) + 1);
  };

  for (const m of enrichedMasail) {
    const seen = new Set<string>();
    const allIds = [m.tabwib_id, ...(m.tabwib_sekunder ?? [])];
    for (const tid of allIds) {
      let curr = tabwibById.get(tid);
      while (curr) {
        if (!seen.has(curr.id)) {
          seen.add(curr.id);
          addCount(curr.id);
        }
        curr = curr.parent_id ? tabwibById.get(curr.parent_id) : undefined;
      }
    }
  }

  const nodeMap = new Map<string, TabwibNode>();
  for (const t of tabwibList) {
    nodeMap.set(t.id, {
      ...t,
      count: directCounts.get(t.id) ?? 0,
      children: [],
    });
  }

  const roots: TabwibNode[] = [];
  for (const t of tabwibList) {
    const node = nodeMap.get(t.id)!;
    if (t.parent_id && nodeMap.has(t.parent_id)) {
      nodeMap.get(t.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function getAllForums(): (ForumItem & { count: number })[] {
  const counts = new Map<string, number>();
  for (const m of enrichedMasail) {
    counts.set(m.forum_id, (counts.get(m.forum_id) ?? 0) + 1);
  }
  return forumsList.map((f) => ({
    ...f,
    count: counts.get(f.id) ?? 0,
  }));
}

export function getForumById(id: string): ForumItem | undefined {
  return forumById.get(id);
}

export function getAllDokumenPdf(): (DokumenPdfItem & {
  forum_nama: string;
  forum_tingkat: string;
  masail_count: number;
  sample_masail: { id: string; judul: string; halaman_mulai: number; tabwib_id: string }[];
})[] {
  const byDoc = new Map<string, EnrichedMasailItem[]>();
  for (const m of enrichedMasail) {
    if (m.pdf?.dokumen_pdf_id) {
      const list = byDoc.get(m.pdf.dokumen_pdf_id) ?? [];
      list.push(m);
      byDoc.set(m.pdf.dokumen_pdf_id, list);
    }
  }
  return dokumenPdfList.map((d) => {
    const f = forumById.get(d.forum_id);
    const items = (byDoc.get(d.id) ?? []).sort(
      (a, b) => (a.pdf?.halaman_mulai ?? 1) - (b.pdf?.halaman_mulai ?? 1)
    );
    return {
      ...d,
      forum_nama: f?.nama ?? d.sumber_label,
      forum_tingkat: f?.tingkat ?? "pbnu",
      masail_count: items.length,
      sample_masail: items.slice(0, 3).map((m) => ({
        id: m.id,
        judul: m.judul,
        halaman_mulai: m.pdf?.halaman_mulai ?? 1,
        tabwib_id: m.tabwib_id,
      })),
    };
  });
}

export function getMasailByPdfDocId(pdfId: string): EnrichedMasailItem[] {
  return enrichedMasail
    .filter((m) => m.pdf?.dokumen_pdf_id === pdfId)
    .sort((a, b) => (a.pdf?.halaman_mulai ?? 1) - (b.pdf?.halaman_mulai ?? 1));
}

export function getDokumenPdfById(id: string): DokumenPdfItem | undefined {
  return pdfById.get(id);
}

export function getMasailBySlug(slug: string): EnrichedMasailItem | undefined {
  return masailBySlug.get(slug);
}

export function getMasailById(id: string): EnrichedMasailItem | undefined {
  return masailById.get(id);
}

export function getRelatedMasail(
  item: EnrichedMasailItem,
  limit = 4
): EnrichedMasailItem[] {
  return enrichedMasail
    .filter(
      (m) =>
        m.id !== item.id &&
        (m.tabwib_id === item.tabwib_id ||
          m.tabwib_kitab_id === item.tabwib_kitab_id)
    )
    .slice(0, limit);
}

export interface MasailFilterParams {
  tabwib?: string; // kode or id or slug
  forum?: string;
  komisi?: KomisiType | "";
  tipe?: TipeAkses | "";
  q?: string;
  page?: number;
  limit?: number;
}

function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

export function queryMasail(params: MasailFilterParams) {
  const {
    tabwib,
    forum,
    komisi,
    tipe,
    q,
    page = 1,
    limit = 18,
  } = params;

  // Resolve tabwib slug to id if needed
  let targetTabwibId = tabwib?.trim() || "";
  if (targetTabwibId && !tabwibById.has(targetTabwibId)) {
    const bySlug = tabwibBySlug.get(targetTabwibId);
    if (bySlug) targetTabwibId = bySlug.id;
  }

  const normalizedQ = q ? normalizeQuery(q) : "";
  const tokens = normalizedQ ? normalizedQ.split(/\s+/).filter(Boolean) : [];

  const filtered = enrichedMasail.filter((m) => {
    if (targetTabwibId) {
      const allTabwibs = [m.tabwib_id, ...(m.tabwib_sekunder ?? [])];
      const matchesTabwib = allTabwibs.some(
        (tid) => tid === targetTabwibId || tid.startsWith(`${targetTabwibId}.`)
      );
      if (!matchesTabwib) return false;
    }

    if (forum && m.forum_id !== forum) return false;
    if (komisi && m.komisi !== komisi) return false;
    if (tipe) {
      if (tipe === "pdf" && m.tipe_akses === "artikel") return false;
      if (tipe === "artikel" && m.tipe_akses === "pdf") return false;
      if (tipe === "keduanya" && m.tipe_akses !== "keduanya") return false;
    }

    if (tokens.length > 0) {
      const haystack = normalizeQuery(
        `${m.judul} ${m.ringkasan_singkat} ${m.tabwib_nama} ${m.tabwib_nama_ar} ${m.tabwib_kitab_nama} ${m.forum_nama} ${m.tags.join(" ")}`
      );
      for (const tok of tokens) {
        if (!haystack.includes(tok)) return false;
      }
    }

    return true;
  });

  // Sort newest first, then by tabwib code
  const sorted = [...filtered].sort((a, b) => {
    const yearDiff = (b.tahun ?? 0) - (a.tahun ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return a.tabwib_id.localeCompare(b.tabwib_id);
  });

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * safeLimit;
  const items = sorted.slice(start, start + safeLimit);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
}

export function getCatalogStats() {
  const totalMasail = enrichedMasail.length;
  const totalPdfDocs = dokumenPdfList.length;
  const totalArtikel = enrichedMasail.filter(
    (m) => m.tipe_akses === "artikel" || m.tipe_akses === "keduanya"
  ).length;
  const totalKitabTabwib = tabwibList.filter((t) => t.level === 1).length;
  const totalBabTabwib = tabwibList.filter((t) => t.level === 2).length;
  const totalForums = forumsList.length;

  return {
    totalMasail,
    totalPdfDocs,
    totalArtikel,
    totalKitabTabwib,
    totalBabTabwib,
    totalForums,
  };
}
