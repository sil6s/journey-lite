#!/usr/bin/env tsx
/**
 * Crawls the JourneyLite WordPress blog, extracts every post,
 * and saves raw HTML, Markdown packets, and JSON exports.
 *
 * Usage:
 *   npm run crawl:journeylite-blog
 *   npm run crawl:journeylite-blog -- --limit 10
 *   npm run crawl:journeylite-blog -- --resume          (skip already-saved slugs)
 *   npm run crawl:journeylite-blog -- --slug some-slug  (re-crawl one post)
 */

import fs from "fs-extra";
import path from "path";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import pLimit from "p-limit";
import { extractPost } from "../lib/migration/journeylite/extractPost";
import { normalizePost } from "../lib/migration/journeylite/normalizePost";
import { buildMarkdownPacket } from "../lib/migration/journeylite/markdownPacket";
import { validatePost } from "../lib/migration/journeylite/validatePost";
import { downloadImage, appendToManifest } from "../lib/migration/journeylite/downloadImages";
import type { NormalizedPost } from "../lib/migration/journeylite/normalizePost";

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.join(process.cwd(), "migration/journeylite-blog");
const RAW_DIR = path.join(ROOT, "raw-html");
const MD_DIR = path.join(ROOT, "markdown");
const JSON_DIR = path.join(ROOT, "json");
const REPORTS_DIR = path.join(ROOT, "reports");
const AUTHOR_MAP_PATH = path.join(REPORTS_DIR, "author-map.json");
const CATEGORY_MAP_PATH = path.join(REPORTS_DIR, "category-map.json");
const INTERNAL_LINK_MAP_PATH = path.join(REPORTS_DIR, "internal-link-map.json");
const FAILED_PATH = path.join(REPORTS_DIR, "failed-posts.json");
const SUMMARY_PATH = path.join(REPORTS_DIR, "migration-summary.json");
const NEEDS_REVIEW_PATH = path.join(REPORTS_DIR, "needs-review.csv");

// ── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = "https://journeylite.com";
const BLOG_URL = "https://journeylite.com/blog";
const CONCURRENCY = 3;
const DELAY_MS = 800;
const MAX_RETRIES = 2;

const SKIP_URL_PATTERNS = [
  /\/wp-login/,
  /\/wp-admin/,
  /\/cart/,
  /\/checkout/,
  /\/account/,
  /\/appointment/,
  /\/schedule-an-appointment/,
  /\/shop/,
  /\/location/,
  /\/services\//,
  /\/contact/,
  /\/about/,
  /\/team/,
  /\/studio/,
  /\/page\/\d+\/?$/,    // top-level pagination — handled separately
  /\?/,
  /#/,
];

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getArg(name: string): string | null {
  const eqForm = args.find((a) => a.startsWith(`${name}=`));
  if (eqForm) return eqForm.split("=").slice(1).join("=");
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length && !args[idx + 1].startsWith("--")) {
    return args[idx + 1];
  }
  return null;
}

const POST_LIMIT_ARG = getArg("--limit");
const POST_LIMIT = POST_LIMIT_ARG ? parseInt(POST_LIMIT_ARG, 10) : Infinity;
const RESUME = args.includes("--resume");
const TARGET_SLUG = getArg("--slug");

// ── Turndown ─────────────────────────────────────────────────────────────────
const td = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});
td.keep(["figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td"]);

// ── Report state ─────────────────────────────────────────────────────────────
interface FailedPost { url: string; error: string; timestamp: string; retries: number }
const failedPosts: FailedPost[] = [];
const processedSlugs = new Set<string>();
let totalImages = 0;
let totalDownloaded = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; JourneyLiteMigrator/1.0; +https://journeylite.com)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error("Unreachable");
}

// ── Discover post URLs from archive ─────────────────────────────────────────
async function discoverPostUrls(): Promise<string[]> {
  const allUrls = new Set<string>();
  let page = 1;

  while (true) {
    const archiveUrl = page === 1 ? BLOG_URL : `${BLOG_URL}/page/${page}/`;
    log(`Crawling archive page ${page}: ${archiveUrl}`);

    let html: string;
    try {
      html = await fetchWithRetry(archiveUrl);
    } catch (err) {
      log(`Archive page ${page} failed: ${err}`);
      break;
    }

    const $ = cheerio.load(html);
    const foundOnPage: string[] = [];

    // WordPress archives list posts inside <article> elements with class "post" or "type-post".
    // We grab permalink links from within those containers only, which avoids nav/sidebar links.
    const postContainerSel =
      "article.post, article.type-post, .post-list article, " +
      ".blog-post-entry, .entry-summary, .hentry, " +
      "h2.entry-title a, h3.entry-title a, .post-title a";

    // First try: links inside article post containers
    let candidateLinks: string[] = [];
    $(postContainerSel + " a[href], " + "article a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (!href.startsWith(BASE_URL)) return;
      if (SKIP_URL_PATTERNS.some((p) => p.test(href))) return;
      try {
        const u = new URL(href);
        if (u.search || u.hash) return;
        const parts = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
        const BAD = ["blog", "page", "category", "tag", "author", "feed", "wp-content", "wp-includes"];
        if (parts.length === 1 && !BAD.includes(parts[0])) {
          candidateLinks.push(href.split("#")[0].replace(/\/$/, "") + "/");
        }
      } catch {}
    });

    // If the site doesn't use standard article wrappers, fall back to all links
    if (candidateLinks.length === 0) {
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        if (!href.startsWith(BASE_URL)) return;
        if (SKIP_URL_PATTERNS.some((p) => p.test(href))) return;
        try {
          const u = new URL(href);
          if (u.search || u.hash) return;
          const parts = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
          const BAD = ["blog", "page", "category", "tag", "author", "feed", "wp-content", "wp-includes",
            "services", "about", "team", "contact", "location", "appointment",
            "schedule", "shop", "cart", "account", "studio"];
          if (parts.length === 1 && !BAD.includes(parts[0])) {
            candidateLinks.push(href.split("#")[0].replace(/\/$/, "") + "/");
          }
        } catch {}
      });
    }

    // Deduplicate and add new
    for (const href of candidateLinks) {
      if (!allUrls.has(href)) {
        allUrls.add(href);
        foundOnPage.push(href);
      }
    }

    log(`Found ${foundOnPage.length} new posts on archive page ${page} (total: ${allUrls.size})`);

    if (foundOnPage.length === 0) {
      log("No new posts found — stopping archive pagination");
      break;
    }

    // Check for next page link
    const hasNextPage =
      $("a.next.page-numbers, .nav-links a[rel='next'], a[rel='next']").length > 0;
    if (!hasNextPage) {
      log("No next page link found — done with archive");
      break;
    }

    page++;
    await sleep(DELAY_MS);
  }

  return [...allUrls];
}

// ── Process a single post ────────────────────────────────────────────────────
async function processPost(url: string): Promise<NormalizedPost | null> {
  log(`Processing: ${url}`);

  let html: string;
  try {
    html = await fetchWithRetry(url);
  } catch (err) {
    failedPosts.push({ url, error: String(err), timestamp: new Date().toISOString(), retries: MAX_RETRIES });
    log(`FAILED to fetch: ${url} — ${err}`);
    return null;
  }

  let raw;
  try {
    raw = extractPost(html, url);
  } catch (err) {
    failedPosts.push({ url, error: `Extract error: ${err}`, timestamp: new Date().toISOString(), retries: 0 });
    log(`FAILED to extract: ${url} — ${err}`);
    return null;
  }

  // Convert body HTML to Markdown
  let bodyMarkdown = "";
  try {
    bodyMarkdown = td.turndown(raw.bodyHtml || "");
  } catch (err) {
    bodyMarkdown = "";
    log(`Markdown conversion failed for ${url}: ${err}`);
  }

  const post = normalizePost(raw, bodyMarkdown);

  if (processedSlugs.has(post.slug)) {
    log(`Skipping duplicate slug: ${post.slug}`);
    return null;
  }
  processedSlugs.add(post.slug);

  if (RESUME && (await fs.pathExists(path.join(JSON_DIR, `${post.slug}.json`)))) {
    log(`Resuming — skipping already-saved: ${post.slug}`);
    return null;
  }

  const validation = validatePost(post);
  if (!validation.valid) {
    post.migrationNotes.push(...validation.errors.map((e) => `VALIDATION ERROR: ${e}`));
    post.needsReview = true;
  }
  if (validation.warnings.length > 0) {
    post.migrationNotes.push(...validation.warnings.map((w) => `Warning: ${w}`));
  }

  // ── Save raw HTML ──
  await fs.ensureDir(RAW_DIR);
  await fs.writeFile(path.join(RAW_DIR, `${post.slug}.html`), html, "utf8");

  // ── Save JSON ──
  await fs.ensureDir(JSON_DIR);
  await fs.writeJson(path.join(JSON_DIR, `${post.slug}.json`), post, { spaces: 2 });

  // ── Save Markdown packet ──
  await fs.ensureDir(MD_DIR);
  const packet = buildMarkdownPacket(post);
  await fs.writeFile(path.join(MD_DIR, `${post.slug}.md`), packet, "utf8");

  // ── Download images ──
  const imageEntries = [];
  const allImages = [
    ...(post.featuredImageUrl
      ? [{ src: post.featuredImageUrl, alt: post.featuredImageAlt, caption: "" }]
      : []),
    ...post.inlineImages,
  ];

  totalImages += allImages.length;
  for (const img of allImages) {
    const entry = await downloadImage(img.src, img.alt, img.caption, post.slug);
    if (entry.downloaded) totalDownloaded++;
    imageEntries.push(entry);
  }
  if (imageEntries.length > 0) {
    await appendToManifest(imageEntries);
  }

  log(
    `Saved: ${post.slug} | words: ${post.wordCount} | review: ${post.needsReview} | medical: ${post.medicalReviewRecommended}`
  );
  return post;
}

// ── Reports ──────────────────────────────────────────────────────────────────
async function buildReports(posts: NormalizedPost[], totalUrls: number, archivePages: number) {
  await fs.ensureDir(REPORTS_DIR);

  // Author map
  const authorMap: Record<string, { displayName: string; sanityRef: null; needsMapping: boolean }> = {};
  for (const p of posts) {
    if (p.author && !authorMap[p.author]) {
      authorMap[p.author] = { displayName: p.author, sanityRef: null, needsMapping: true };
    }
  }
  await fs.writeJson(AUTHOR_MAP_PATH, authorMap, { spaces: 2 });

  // Category map
  const categoryMap: Record<string, { normalized: string; sanityRef: null; needsMapping: boolean }> = {};
  for (const p of posts) {
    for (const c of p.categories) {
      if (!categoryMap[c]) {
        categoryMap[c] = { normalized: c, sanityRef: null, needsMapping: true };
      }
    }
  }
  await fs.writeJson(CATEGORY_MAP_PATH, categoryMap, { spaces: 2 });

  // Internal link map
  const internalLinkMap: Record<string, { anchorTexts: string[]; mappedSlug: string | null; needsMapping: boolean }> = {};
  for (const p of posts) {
    for (const link of p.internalLinks) {
      if (!internalLinkMap[link.url]) {
        internalLinkMap[link.url] = { anchorTexts: [], mappedSlug: null, needsMapping: true };
      }
      if (!internalLinkMap[link.url].anchorTexts.includes(link.text)) {
        internalLinkMap[link.url].anchorTexts.push(link.text);
      }
    }
    // Map links that point to migrated post slugs
    const slugByUrl = new Map(posts.map((p) => [p.sourceUrl.replace(/\/$/, ""), p.slug]));
    for (const [url, entry] of Object.entries(internalLinkMap)) {
      const normalized = url.replace(/\/$/, "");
      if (slugByUrl.has(normalized)) {
        entry.mappedSlug = slugByUrl.get(normalized)!;
        entry.needsMapping = false;
      }
    }
  }
  await fs.writeJson(INTERNAL_LINK_MAP_PATH, internalLinkMap, { spaces: 2 });

  // Summary
  const allCategories = [...new Set(posts.flatMap((p) => p.categories))];
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  const allAuthors = [...new Set(posts.map((p) => p.author).filter(Boolean))];
  const summary = {
    generatedAt: new Date().toISOString(),
    archivePagesCrawled: archivePages,
    totalPostUrlsFound: totalUrls,
    totalPostsExtracted: posts.length,
    totalPostsFailed: failedPosts.length,
    totalImagesFound: totalImages,
    totalImagesDownloaded: totalDownloaded,
    totalNeedingReview: posts.filter((p) => p.needsReview).length,
    totalMedicalReviewRecommended: posts.filter((p) => p.medicalReviewRecommended).length,
    categoriesFound: allCategories,
    tagsFound: allTags,
    authorsFound: allAuthors,
  };
  await fs.writeJson(SUMMARY_PATH, summary, { spaces: 2 });

  // Failed posts
  await fs.writeJson(FAILED_PATH, failedPosts, { spaces: 2 });

  // Needs-review CSV
  const csvRows = [
    "title,slug,sourceUrl,reason,author,publishedAt",
    ...posts
      .filter((p) => p.needsReview)
      .map((p) =>
        [
          `"${p.title.replace(/"/g, '""')}"`,
          p.slug,
          p.sourceUrl,
          `"${p.migrationNotes.join("; ").replace(/"/g, '""')}"`,
          `"${p.author.replace(/"/g, '""')}"`,
          p.publishedAt,
        ].join(",")
      ),
  ];
  await fs.writeFile(NEEDS_REVIEW_PATH, csvRows.join("\n"), "utf8");

  log(`Reports saved to ${REPORTS_DIR}`);
  log(`Summary: ${posts.length} posts | ${failedPosts.length} failed | ${summary.totalNeedingReview} need review`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await fs.ensureDir(ROOT);
  log("Starting JourneyLite blog crawl");

  let postUrls: string[];
  let archivePages = 0;

  if (TARGET_SLUG) {
    postUrls = [`${BASE_URL}/${TARGET_SLUG}/`];
    log(`Single-post mode: ${TARGET_SLUG}`);
  } else {
    postUrls = await discoverPostUrls();
    // Count how many archive pages we crawled (estimate from pagination)
    archivePages = Math.ceil(postUrls.length / 10);
    log(`Discovered ${postUrls.length} post URLs`);
  }

  const limited = POST_LIMIT < Infinity ? postUrls.slice(0, POST_LIMIT) : postUrls;
  log(`Processing ${limited.length} posts (limit: ${POST_LIMIT})`);

  const limiter = pLimit(CONCURRENCY);
  const allPosts: NormalizedPost[] = [];

  const tasks = limited.map((url) =>
    limiter(async () => {
      await sleep(DELAY_MS);
      const post = await processPost(url);
      if (post) allPosts.push(post);
    })
  );

  await Promise.all(tasks);

  if (allPosts.length > 0 || failedPosts.length > 0) {
    await buildReports(allPosts, postUrls.length, archivePages);
  }

  log("Crawl complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
