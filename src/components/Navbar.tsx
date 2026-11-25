"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Landmark, Menu, X } from "lucide-react";
import { useState } from "react";
import { PwaInstallButton } from "./PwaRegister";

const NAV_ITEMS = [
  { href: "/", label: "Tabwib & Fatwa", icon: BookOpen },
  { href: "/pustaka-pdf", label: "Pustaka PDF", icon: FileText },
  { href: "/forum", label: "Forum & Muktamar", icon: Landmark },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#0c5c3d]/20 bg-[#0d6b47] text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-[#d4a243]/50 transition group-hover:bg-white/15">
            <img
              src="/icon.svg"
              alt="Khazanah Bahtsul Masail"
              className="h-8 w-8 rounded-lg"
            />
          </div>
          <div className="leading-tight">
            <div className="font-serif-title text-base font-bold tracking-tight text-white sm:text-lg">
              Khazanah Bahtsul Masail
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-100/85">
              <span className="font-arabic text-xs text-[#f0cc7e]">
                خزانة بحث المسائل
              </span>
              <span className="hidden sm:inline">· Full Online &amp; Ringan</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/" || pathname.startsWith("/masalah/")
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white ring-1 ring-white/20"
                    : "text-emerald-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 text-[#f0cc7e]" />
                <span>{label}</span>
              </Link>
            );
          })}
          <div className="ml-2">
            <PwaInstallButton />
          </div>
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <PwaInstallButton />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Buka menu navigasi"
            className="rounded-lg p-2 text-emerald-100 hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open ? (
        <nav className="border-t border-white/10 bg-[#0a5739] px-4 py-2.5 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-emerald-100 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4 text-[#f0cc7e]" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
