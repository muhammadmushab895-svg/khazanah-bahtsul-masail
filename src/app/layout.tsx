import type { Metadata, Viewport } from "next";
import { Amiri, Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { OfflineBanner } from "@/components/PwaRegister";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Khazanah Bahtsul Masail — Repositori Online Fikih NU & Pesantren",
    template: "%s · Khazanah Bahtsul Masail",
  },
  description:
    "PWA full online yang ringan dengan tabwib fikih rapi untuk mengakses langsung tulisan fatwa dan dokumen PDF Bahtsul Masail NU, Muktamar, Munas, Ma'had Aly, serta pesantren.",
  applicationName: "Khazanah Bahtsul Masail",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bahtsul Masail",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d6b47",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${newsreader.variable} ${amiri.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[#faf8f3] text-[#1b241f]">
        <OfflineBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-12 border-t border-[#e5dfd1] bg-[#f4f0e6]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-[#536058] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="font-serif-title text-sm font-bold text-[#0d6b47]">
                Khazanah Bahtsul Masail{" "}
                <span className="font-arabic ml-1 text-sm text-[#b8862d]">
                  خزانة بحث المسائل
                </span>
              </div>
              <p className="mt-1 max-w-xl leading-relaxed">
                Indeks &amp; tabwib fikih ringan berbasis{" "}
                <strong>full online</strong>. Dokumen PDF dan tulisan fatwa
                dialirkan langsung dari sumber resmi (PBNU / Internet Archive,
                NU Online, Ma&apos;had Aly Lirboyo, PP. Sidogiri, dan PISS-KTB)
                tanpa membebani penyimpanan perangkat.
              </p>
            </div>
            <div className="shrink-0 text-[#738077]">
              PWA Online-First · Tanpa Beban Penyimpanan Lokal
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
