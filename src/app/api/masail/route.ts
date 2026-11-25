import { NextRequest, NextResponse } from "next/server";
import { queryMasail } from "@/lib/catalog";
import type { KomisiType, TipeAkses } from "@/types/catalog";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const tabwib = sp.get("tabwib") || undefined;
  const forum = sp.get("forum") || undefined;
  const komisi = (sp.get("komisi") || "") as KomisiType | "";
  const tipe = (sp.get("tipe") || "") as TipeAkses | "";
  const q = sp.get("q") || undefined;
  const page = Number(sp.get("page") || "1") || 1;
  const limit = Number(sp.get("limit") || "18") || 18;

  const result = queryMasail({
    tabwib,
    forum,
    komisi,
    tipe,
    q,
    page,
    limit,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
