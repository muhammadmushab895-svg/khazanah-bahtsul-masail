"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookMarked,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Globe,
  Layers,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  EnrichedMasailItem,
  ForumItem,
  KomisiType,
  TabwibNode,
  TipeAkses,
} from "@/types/catalog";
import { MasailCard } from "./MasailCard";

interface TabwibExplorerProps {
  tree: TabwibNode[];
  forums: (ForumItem & { count: number })[];
  items: EnrichedMasailItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  activeFilters: {
    tabwib: string;
    forum: string;
    komisi: KomisiType | "";
    tipe: TipeAkses | "";
    q: string;
  };
  activeTabwibMeta?: {
    id: string;
    nama_id: string;
    nama_ar: string;
    deskripsi?: string;
  } | null;
  totalPdfDocs?: number;
}

export function TabwibExplorer({
  tree,
  forums,
  items,
  pagination,
  activeFilters,
  activeTabwibMeta,
  totalPdfDocs = 0,
}: TabwibExplorerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(activeFilters.q);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Expand active root kitabs by default (and kitab 01/02 if none selected)
  const [expandedKitabs, setExpandedKitabs] = useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      for (const root of tree) {
        init[root.id] =
          activeFilters.tabwib.startsWith(root.id) ||
          (!activeFilters.tabwib && (root.id === "01" || root.id === "02"));
      }
      return init;
    }
  );

  const navigateWithFilters = (
    overrides: Partial<typeof activeFilters & { page: number }>
  ) => {
    const next = {
      tabwib: activeFilters.tabwib,
      forum: activeFilters.forum,
      komisi: activeFilters.komisi,
      tipe: activeFilters.tipe,
      q: activeFilters.q,
      page: 1,
      ...overrides,
    };

    const sp = new URLSearchParams();
    if (next.tabwib) sp.set("tabwib", next.tabwib);
    if (next.forum) sp.set("forum", next.forum);
    if (next.komisi) sp.set("komisi", next.komisi);
    if (next.tipe) sp.set("tipe", next.tipe);
    if (next.q.trim()) sp.set("q", next.q.trim());
    if (next.page > 1) sp.set("page", String(next.page));

    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/", { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithFilters({ q: searchInput, page: 1 });
  };

  const hasAnyFilter = Boolean(
    activeFilters.tabwib ||
      activeFilters.forum ||
      activeFilters.komisi ||
      activeFilters.tipe ||
      activeFilters.q
  );

  const toggleKitab = (id: string) => {
    setExpandedKitabs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTabwibSidebar = () => (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          navigateWithFilters({ tabwib: "", page: 1 });
          setMobileDrawerOpen(false);
        }}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
          !activeFilters.tabwib
            ? "bg-[#0d6b47] text-white shadow-sm"
            : "text-[#1b241f] hover:bg-[#f2eee4]"
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span>Semua Bab Tabwib</span>
        </span>
      </button>

      {tree.map((kitab) => {
        const isKitabActive = activeFilters.tabwib === kitab.id;
        const isExpanded = Boolean(expandedKitabs[kitab.id]);

        return (
          <div
            key={kitab.id}
            className="rounded-xl border border-[#ece6d9] bg-white/80"
          >
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => toggleKitab(kitab.id)}
                aria-label={`Buka sub-bab ${kitab.nama_id}`}
                className="p-2.5 text-[#536058] hover:text-[#0d6b47]"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpandedKitabs((prev) => ({ ...prev, [kitab.id]: true }));
                  navigateWithFilters({ tabwib: kitab.id, page: 1 });
                  setMobileDrawerOpen(false);
                }}
                className={`flex flex-1 items-center justify-between rounded-r-xl py-2 pr-3 text-left transition ${
                  isKitabActive
                    ? "bg-[#e8f5ef] font-bold text-[#094f34]"
                    : "hover:bg-[#f7f4ec]"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="truncate text-xs font-bold text-[#1b241f]">
                    <span className="mr-1 text-[#0d6b47]">{kitab.kode}.</span>
                    {kitab.nama_id.replace(/\s*\([^)]*\)/, "")}
                  </div>
                  <div className="font-arabic truncate text-xs text-[#8c6115]">
                    {kitab.nama_ar}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[#f2eee4] px-2 py-0.5 text-[11px] font-semibold text-[#0d6b47]">
                  {kitab.count}
                </span>
              </button>
            </div>

            {isExpanded && kitab.children.length > 0 ? (
              <div className="space-y-0.5 border-t border-[#f0ebe0] px-2 py-1.5">
                {kitab.children.map((bab) => {
                  const isBabActive = activeFilters.tabwib === bab.id;
                  return (
                    <button
                      key={bab.id}
                      type="button"
                      onClick={() => {
                        navigateWithFilters({ tabwib: bab.id, page: 1 });
                        setMobileDrawerOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                        isBabActive
                          ? "bg-[#0d6b47] font-semibold text-white"
                          : "text-[#425048] hover:bg-[#f2eee4]"
                      }`}
                    >
                      <span className="truncate pr-2">
                        <span
                          className={`mr-1.5 font-mono text-[10px] ${
                            isBabActive ? "text-[#f0cc7e]" : "text-[#8a948d]"
                          }`}
                        >
                          {bab.kode}
                        </span>
                        {bab.nama_id}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          isBabActive
                            ? "bg-white/20 text-white"
                            : "bg-[#f2eee4] text-[#536058]"
                        }`}
                      >
                        {bab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Quick Search & Filter Bar */}
      <div className="mb-6 rounded-2xl border border-[#e5dfd1] bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 md:flex-row md:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#738077]" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari pembahasan Bahtsul Masail, bab fikih, atau kata kunci (misal: emas digital, nikah online, muktamar)..."
              className="w-full rounded-xl border border-[#dfd8c8] bg-[#faf8f3] py-2.5 pl-10 pr-4 text-sm text-[#1b241f] placeholder:text-[#7e8a82] focus:border-[#0d6b47] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d6b47]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter Forum"
              value={activeFilters.forum}
              onChange={(e) =>
                navigateWithFilters({ forum: e.target.value, page: 1 })
              }
              className="rounded-xl border border-[#dfd8c8] bg-[#faf8f3] px-3 py-2.5 text-xs font-medium text-[#1b241f] focus:border-[#0d6b47] focus:outline-none"
            >
              <option value="">Semua Forum &amp; Sumber</option>
              {forums
                .filter((f) => f.count > 0)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.singkatan} ({f.count})
                  </option>
                ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-[#0d6b47] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#094f34]"
            >
              Cari
            </button>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfd8c8] bg-[#faf8f3] px-3 py-2.5 text-xs font-semibold text-[#0d6b47] lg:hidden"
            >
              <BookMarked className="h-4 w-4" />
              <span>Pilih Tabwib</span>
            </button>
          </div>
        </form>

        {/* Secondary Filter Pills: Access Type & Komisi */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#f2eee4] pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#738077]">
              <Filter className="h-3 w-3" /> Format:
            </span>
            {(
              [
                { value: "", label: "Semua" },
                { value: "artikel", label: "Tulisan Online" },
                { value: "pdf", label: "Dokumen PDF" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() =>
                  navigateWithFilters({ tipe: opt.value, page: 1 })
                }
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeFilters.tipe === opt.value
                    ? "bg-[#0d6b47] text-white"
                    : "bg-[#f2eee4] text-[#425048] hover:bg-[#e5dfd1]"
                }`}
              >
                {opt.value === "pdf" ? (
                  <FileText className="h-3 w-3" />
                ) : opt.value === "artikel" ? (
                  <Globe className="h-3 w-3" />
                ) : null}
                <span>{opt.label}</span>
              </button>
            ))}

            <span className="mx-1 hidden h-4 w-px bg-[#e5dfd1] sm:inline-block" />

            <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#738077]">
              <SlidersHorizontal className="h-3 w-3" /> Komisi:
            </span>
            {(
              [
                { value: "", label: "Semua" },
                { value: "waqiiyah", label: "Waqi'iyah" },
                { value: "maudhuiyah", label: "Maudhu'iyah" },
                { value: "qanuniyah", label: "Qanuniyah" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value || "all-k"}
                type="button"
                onClick={() =>
                  navigateWithFilters({ komisi: opt.value, page: 1 })
                }
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  activeFilters.komisi === opt.value
                    ? "bg-[#b8862d] text-white"
                    : "bg-[#faf8f3] text-[#536058] ring-1 ring-[#e5dfd1] hover:bg-[#f2eee4]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hasAnyFilter ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                navigateWithFilters({
                  tabwib: "",
                  forum: "",
                  komisi: "",
                  tipe: "",
                  q: "",
                  page: 1,
                });
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#9a4b1f] hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filter</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Main 2-Column Layout: Sticky Tabwib Sidebar + Masail Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:col-span-4 lg:block xl:col-span-3">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-serif-title text-base font-bold text-[#1b241f]">
                Tabwib Fikih
              </h2>
              <span className="font-arabic text-sm text-[#b8862d]">
                تبويب الفقه
              </span>
            </div>
            {renderTabwibSidebar()}
          </div>
        </aside>

        {/* Results Panel */}
        <section className="lg:col-span-8 xl:col-span-9">
          {/* Active Tabwib Banner */}
          {activeTabwibMeta ? (
            <div className="mb-5 rounded-2xl border border-[#d5e7de] bg-[#eef7f2] p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0d6b47]">
                    Tabwib {activeTabwibMeta.id}
                  </span>
                  <h2 className="font-serif-title text-xl font-bold text-[#102a1f]">
                    {activeTabwibMeta.nama_id}
                  </h2>
                </div>
                <span className="font-arabic text-xl text-[#0d6b47]">
                  {activeTabwibMeta.nama_ar}
                </span>
              </div>
              {activeTabwibMeta.deskripsi ? (
                <p className="mt-1.5 text-sm text-[#42594e]">
                  {activeTabwibMeta.deskripsi}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Result Count Header */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-[#536058]">
              Menampilkan{" "}
              <strong className="text-[#1b241f]">{items.length}</strong> dari{" "}
              <strong className="text-[#1b241f]">{pagination.total}</strong>{" "}
              pembahasan online
              {isPending ? " · Memuat..." : ""}
            </p>
            <Link
              href="/pustaka-pdf"
              className="text-xs font-semibold text-[#0d6b47] hover:underline"
            >
              Lihat semua {totalPdfDocs} arsip PDF →
            </Link>
          </div>

          {/* Cards Grid */}
          {items.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-2 transition-opacity ${
                isPending ? "opacity-60" : "opacity-100"
              }`}
            >
              {items.map((item) => (
                <MasailCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d9d1c0] bg-white px-6 py-12 text-center">
              <p className="font-serif-title text-lg font-bold text-[#1b241f]">
                Belum ada pembahasan yang cocok
              </p>
              <p className="mt-1 text-sm text-[#536058]">
                Coba gunakan kata kunci yang lebih singkat atau pilih bab tabwib lainnya.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  navigateWithFilters({
                    tabwib: "",
                    forum: "",
                    komisi: "",
                    tipe: "",
                    q: "",
                    page: 1,
                  });
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0d6b47] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094f34]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Tampilkan Semua Pembahasan
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  navigateWithFilters({ page: pagination.page - 1 })
                }
                className="rounded-xl border border-[#dfd8c8] bg-white px-3.5 py-2 text-xs font-semibold text-[#1b241f] disabled:opacity-40 hover:bg-[#f2eee4]"
              >
                ← Sebelumnya
              </button>
              <span className="px-3 text-xs font-medium text-[#536058]">
                Halaman <strong>{pagination.page}</strong> dari{" "}
                <strong>{pagination.totalPages}</strong>
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  navigateWithFilters({ page: pagination.page + 1 })
                }
                className="rounded-xl border border-[#dfd8c8] bg-white px-3.5 py-2 text-xs font-semibold text-[#1b241f] disabled:opacity-40 hover:bg-[#f2eee4]"
              >
                Berikutnya →
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {/* Mobile Tabwib Drawer */}
      {mobileDrawerOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col bg-[#faf8f3] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5dfd1] bg-[#0d6b47] px-4 py-3 text-white">
              <div>
                <div className="font-serif-title text-base font-bold">
                  Tabwib Fikih
                </div>
                <div className="font-arabic text-xs text-[#f0cc7e]">
                  تبويب المسائل الفقهية
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Tutup drawer tabwib"
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {renderTabwibSidebar()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
