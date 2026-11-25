# Khazanah Bahtsul Masail (PWA Full Online)

Aplikasi Progressive Web App (**PWA**) berbasis Next.js yang **full online, tanpa panel admin, dan sangat ringan**. Aplikasi hanya menyimpan indeks **Tabwib Fikih** beserta metadata & tautan sumber resmi, sementara:

- **Tulisan Fatwa Online** (NU Online, Ma'had Aly Lirboyo, PP. Sidogiri, PISS-KTB) diambil *real-time* melalui API Live Reader (`/api/reader`) dengan pemformatan otomatis *ibarat* teks Arab (`RTL`, font *Amiri*), pengatur ukuran huruf, dan mode baca malam.
- **Dokumen PDF Online** (Munas 2025, Muktamar NU ke-33 s/d #5 tahun 1930, Ahkamul Fuqaha, LBM PCNU) dialirkan langsung secara *streaming* via **Stream Ringan** (Internet Archive Reader) maupun **PDF Langsung** (`/api/pdf-proxy` dengan dukungan HTTP Range & lompat halaman `#page=N`).

## Cara Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Cara Menambah Pembahasan atau PDF Baru (Tanpa Panel Admin)

1. **Tambah Dokumen PDF Online**: tambahkan entri baru di `src/data/dokumen-pdf.json` (`id`, `forum_id`, `judul`, `url_pdf`, `url_halaman_sumber`, `tipe_host`).
2. **Tambah Pembahasan ke Tabwib**: tambahkan entri ringan (< 1 KB) ke salah satu dari 7 file di `src/data/masail/`:
   - `01-ibadat.json`
   - `02-muamalat.json`
   - `03-munakahat.json`
   - `04-jinayat.json`
   - `05-siyasah-qanuniyah.json`
   - `06-aqidah-akhlaq.json`
   - `07-muashirah.json`
3. Deploy ke Vercel/hosting Next.js — perubahan langsung aktif secara online!
