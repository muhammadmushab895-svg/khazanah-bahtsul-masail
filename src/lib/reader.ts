import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { EnrichedMasailItem, ReaderArticleResponse } from "@/types/catalog";

interface CacheEntry {
  data: ReaderArticleResponse;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes temporary memory cache
const MAX_CACHE_ITEMS = 40;
const readerCache = new Map<string, CacheEntry>();

const ARABIC_CHAR_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
const LATIN_CHAR_RE = /[A-Za-z]/g;

const ALLOWED_TAGS = new Set([
  "p",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "b",
  "em",
  "i",
  "br",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "a",
  "span",
  "sub",
  "sup",
  "div",
]);

function isPredominantlyArabic(text: string): boolean {
  const arabicMatches = text.match(ARABIC_CHAR_RE);
  if (!arabicMatches || arabicMatches.length < 12) return false;
  const latinMatches = text.match(LATIN_CHAR_RE);
  const latinCount = latinMatches ? latinMatches.length : 0;
  return arabicMatches.length / (arabicMatches.length + latinCount) >= 0.45;
}

function getSelectorForHost(hostname: string): string[] {
  const host = hostname.toLowerCase();
  if (host.includes("nu.or.id")) {
    return ["#detail-content", ".detail-style", "article"];
  }
  if (host.includes("mahadalylirboyo.ac.id")) {
    return [".wrap-post", ".entry-content", "article"];
  }
  if (host.includes("sidogiri.net")) {
    return ["article .entry-content", ".entry-content", ".article-content"];
  }
  if (host.includes("piss-ktb.com")) {
    return [".post-body", ".entry-content", "article"];
  }
  return [
    '[itemprop="articleBody"]',
    "article .entry-content",
    ".entry-content",
    ".post-content",
    ".post-body",
    "article",
  ];
}

function sanitizeAndFormatHtml(rawFragment: string, baseUrl: string): string {
  const $ = cheerio.load(`<div id="__root__">${rawFragment}</div>`, {
    xml: false,
  });
  const root = $("#__root__");

  // Remove unwanted / noisy elements
  root
    .find(
      "script, style, iframe, noscript, form, input, button, svg, ins, aside, nav, footer, header, figure img, img, .share, .sharedaddy, .related, .related-posts, .baca-juga, .bacajuga, .ads, .iklan, .banner, .tags, .post-tags, .post-meta, .breadcrumb, .breadcrumbs, .navigation, .nav-links, .comments, #comments, .author-box, .wp-block-buttons"
    )
    .remove();

  // Remove "Baca juga:" promotional paragraphs
  root.find("p, div").each((_, el) => {
    const txt = $(el).text().trim();
    if (
      /^baca\s+juga\s*:/i.test(txt) ||
      /^lihat\s+juga\s*:/i.test(txt) ||
      /^simak\s+juga\s*:/i.test(txt) ||
      /^artikel\s+terkait/i.test(txt)
    ) {
      $(el).remove();
    }
  });

  // Walk and sanitize tags & attributes
  const cleanNode = (el: Element) => {
    const tag = el.tagName.toLowerCase();
    const $el = $(el);

    if (!ALLOWED_TAGS.has(tag)) {
      if (tag === "h1") {
        // Demote inner H1 to H2
        const inner = $el.html() ?? "";
        $el.replaceWith(`<h2>${inner}</h2>`);
        return;
      }
      // Unwrap unknown containers, keeping safe children
      $el.replaceWith($el.contents());
      return;
    }

    // Strip all attributes except safe href on <a>
    const attribs = el.attribs ? { ...el.attribs } : {};
    for (const attrName of Object.keys(attribs)) {
      $el.removeAttr(attrName);
    }

    if (tag === "a") {
      const href = attribs.href?.trim();
      if (href && !href.startsWith("javascript:") && !href.startsWith("data:")) {
        try {
          const resolved = new URL(href, baseUrl).toString();
          if (resolved.startsWith("http://") || resolved.startsWith("https://")) {
            $el.attr("href", resolved);
            $el.attr("target", "_blank");
            $el.attr("rel", "noopener noreferrer");
          }
        } catch {
          // ignore malformed URL
        }
      }
    }
  };

  // Traverse bottom-up so unwrapping works cleanly
  const allElements = root.find("*").toArray().reverse();
  for (const el of allElements) {
    cleanNode(el);
  }

  // Highlight predominantly Arabic paragraphs/blockquotes as Ibarat Kitab
  root.find("p, blockquote, div, li").each((_, el) => {
    const $el = $(el);
    // Only tag leaf-level text blocks (not outer wrapper divs)
    if ($el.find("p, blockquote, ul, ol").length > 0) return;
    const text = $el.text().trim();
    if (!text) {
      if ($el.find("br, hr").length === 0) $el.remove();
      return;
    }
    if (isPredominantlyArabic(text)) {
      $el.attr("dir", "rtl");
      $el.attr("class", "arabic-ibarat");
    }
  });

  return root.html()?.trim() ?? "";
}

export async function fetchLiveFatwaArticle(
  item: EnrichedMasailItem
): Promise<ReaderArticleResponse> {
  const sourceUrl = item.artikel?.url;
  const sourceName = item.artikel?.nama_sumber ?? item.forum_singkatan;

  if (!sourceUrl) {
    return {
      ok: false,
      source_mode: "fallback",
      masalah_id: item.id,
      title: item.judul,
      source_name: sourceName,
      source_url: "",
      fetched_at: new Date().toISOString(),
      error_reason: "Pembahasan ini tidak memiliki tautan artikel online.",
    };
  }

  // Check temporary in-memory cache
  const cached = readerCache.get(item.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8,ar;q=0.7",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return {
        ok: false,
        source_mode: "fallback",
        masalah_id: item.id,
        title: item.judul,
        source_name: sourceName,
        source_url: sourceUrl,
        fetched_at: new Date().toISOString(),
        error_reason: `Situs sumber merespons status HTTP ${res.status}.`,
      };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const parsedUrl = new URL(sourceUrl);

    // Extract title
    const extractedTitle =
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content")?.trim() ||
      item.judul;

    // Extract published date & author if available
    const publishedDate =
      $('meta[property="article:published_time"]').attr("content")?.slice(0, 10) ||
      $("time").first().attr("datetime")?.slice(0, 10) ||
      item.artikel?.tanggal_terbit;

    const author =
      $('meta[name="author"]').attr("content")?.trim() ||
      $(".author-name, .entry-author, .byline").first().text().trim() ||
      undefined;

    // Select main article content container
    const selectors = getSelectorForHost(parsedUrl.hostname);
    let rawContent = "";

    for (const sel of selectors) {
      const container = $(sel).first();
      if (container.length && container.text().trim().length > 180) {
        rawContent = container.html() ?? "";
        break;
      }
    }

    // Fallback: pick container with most <p> children
    if (!rawContent) {
      let bestHtml = "";
      let bestScore = 0;
      $("div, section, main, article").each((_, el) => {
        const $el = $(el);
        const pCount = $el.children("p").length;
        const len = $el.text().trim().length;
        if (pCount >= 3 && len > bestScore) {
          bestScore = len;
          bestHtml = $el.html() ?? "";
        }
      });
      rawContent = bestHtml;
    }

    const sanitizedHtml = sanitizeAndFormatHtml(rawContent, sourceUrl);

    if (!sanitizedHtml || sanitizedHtml.length < 100) {
      return {
        ok: false,
        source_mode: "fallback",
        masalah_id: item.id,
        title: extractedTitle,
        source_name: sourceName,
        source_url: sourceUrl,
        published_date: publishedDate,
        fetched_at: new Date().toISOString(),
        error_reason:
          "Isi artikel tidak dapat diekstrak secara otomatis dari situs sumber.",
      };
    }

    const result: ReaderArticleResponse = {
      ok: true,
      source_mode: "live_reader",
      masalah_id: item.id,
      title: extractedTitle,
      source_name: sourceName,
      source_url: sourceUrl,
      published_date: publishedDate,
      author,
      content_html: sanitizedHtml,
      fetched_at: new Date().toISOString(),
    };

    // Store in bounded temporary memory cache
    if (readerCache.size >= MAX_CACHE_ITEMS) {
      const oldestKey = readerCache.keys().next().value;
      if (oldestKey) readerCache.delete(oldestKey);
    }
    readerCache.set(item.id, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return result;
  } catch (err) {
    return {
      ok: false,
      source_mode: "fallback",
      masalah_id: item.id,
      title: item.judul,
      source_name: sourceName,
      source_url: sourceUrl,
      fetched_at: new Date().toISOString(),
      error_reason:
        err instanceof Error && err.name === "AbortError"
          ? "Waktu muat dari situs sumber habis (timeout)."
          : "Gagal terhubung ke situs sumber secara langsung.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
