import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Khazanah Bahtsul Masail",
    short_name: "Bahtsul Masail",
    description:
      "Repositori online ringan dengan tabwib fikih rapi untuk mengakses keputusan PDF dan tulisan Bahtsul Masail NU serta pesantren.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#faf8f3",
    theme_color: "#0d6b47",
    lang: "id",
    categories: ["education", "books", "reference"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
