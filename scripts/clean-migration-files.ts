#!/usr/bin/env tsx
/**
 * Cleans all scraped migration markdown/JSON files:
 *   - Fixes HTML artifacts left by Turndown
 *   - Removes empty links, duplicate links, WordPress shortcodes
 *   - Replaces wp-content image URLs with local /legacy-blog/ paths
 *   - Normalises smush-webp URLs back to uploads paths
 *   - Saves cleaned files in-place
 *
 * Also copies downloaded images to public/legacy-blog/ so they
 * are served by the Next.js app after the WordPress site goes offline.
 *
 * Run: npm run clean:migration
 */

import fs from "fs-extra";
import path from "path";
import type { ImageManifestEntry } from "../lib/migration/journeylite/downloadImages";

const ROOT       = path.join(process.cwd(), "migration/journeylite-blog");
const MD_DIR     = path.join(ROOT, "markdown");
const JSON_DIR   = path.join(ROOT, "json");
const IMG_SRC    = path.join(ROOT, "images");
const IMG_DEST   = path.join(process.cwd(), "public/legacy-blog");
const MANIFEST   = path.join(ROOT, "reports/image-manifest.json");

// ── Build URL lookup from manifest ──────────────────────────────────────────
function buildImageMap(manifest: ImageManifestEntry[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const entry of manifest) {
    if (!entry.downloaded || !entry.localPath) continue;
    const filename = path.basename(entry.localPath);
    const publicPath = `/legacy-blog/${filename}`;

    // Map original URL directly
    map.set(entry.originalUrl, publicPath);

    // Map with and without trailing query strings
    try {
      const u = new URL(entry.originalUrl);
      map.set(`${u.origin}${u.pathname}`, publicPath);
    } catch {}

    // Map smush-webp variant → same file
    if (entry.originalUrl.includes("smush-webp")) {
      const plain = entry.originalUrl
        .replace("/smush-webp/", "/uploads/")
        .replace(/\.webp$/, "");
      map.set(plain, publicPath);
    }

    // Map the plain filename for fuzzy fallback
    const baseName = filename.replace(/^[^_]+__/, ""); // strip postSlug prefix
    map.set(baseName, publicPath);
  }

  return map;
}

// ── Normalise a wp-content image URL ────────────────────────────────────────
// smush-webp/yyyy/mm/name.jpg.webp → uploads/yyyy/mm/name.jpg
function normWpUrl(raw: string): string {
  return raw
    .replace(/\/smush-webp\//g, "/uploads/")
    .replace(/\.webp$/i, "");
}

// Resolve a markdown image URL to a public path, or the normalised wp URL
function resolveImageUrl(raw: string, imageMap: Map<string, string>): string {
  if (imageMap.has(raw))             return imageMap.get(raw)!;
  const norm = normWpUrl(raw);
  if (imageMap.has(norm))            return imageMap.get(norm)!;

  // fuzzy: try just the basename
  const base = path.basename(norm.split("?")[0]);
  if (imageMap.has(base))            return imageMap.get(base)!;

  // Couldn't map locally — return normalised wp URL (no smush path)
  return norm;
}

// ── Markdown body cleanup ────────────────────────────────────────────────────
function cleanMarkdown(body: string, imageMap: Map<string, string>): string {
  let md = body;

  // 1. WordPress block comments
  md = md.replace(/<!--\s*\/?wp:[^\n]*-->/g, "");

  // 2. Empty HTML tags left by Turndown (no meaningful content)
  md = md.replace(/<(div|span|p|section|article|aside|header|footer|nav|figure|figcaption)[^>]*>\s*<\/\1>/gi, "");

  // 3. Strip remaining inline HTML tags (keep text content)
  md = md.replace(/<\/?(div|span|section|article|aside|header|footer|nav|figure|figcaption|strong|em|b|i|u|s|br|hr)[^>]*>/gi, "");

  // 4. &nbsp; → space
  md = md.replace(/&nbsp;/g, " ");

  // 5. Common HTML entities
  md = md.replace(/&amp;/g,  "&")
         .replace(/&lt;/g,   "<")
         .replace(/&gt;/g,   ">")
         .replace(/&quot;/g, '"')
         .replace(/&#8220;/g, "“")
         .replace(/&#8221;/g, "”")
         .replace(/&#8216;/g, "‘")
         .replace(/&#8217;/g, "’")
         .replace(/&#8211;/g, "–")
         .replace(/&#8212;/g, "—");

  // 6. Escaped parentheses inside links (Turndown artifact for special chars)
  md = md.replace(/\\\(/g, "(").replace(/\\\)/g, ")");

  // 7. Empty links [](url) — remove entirely
  md = md.replace(/\[\]\([^)]*\)/g, "");

  // 8. Duplicate consecutive links with same URL
  md = md.replace(/(\[[^\]]+\]\([^)]+\))\n\1/g, "$1");

  // 9. WordPress shortcodes
  md = md.replace(/\[[a-z_]+[^\]]*\](\n|[^[]*\[\/[a-z_]+\])?/gi, "");

  // 10. IAL / attribute markers {.class}
  md = md.replace(/\{[^}]*\}/g, "");

  // 11. Image references — remap URLs
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const trimUrl = url.trim();
    if (!trimUrl.startsWith("http") && !trimUrl.startsWith("/")) return `![${alt}](${trimUrl})`;
    const resolved = resolveImageUrl(trimUrl, imageMap);
    return `![${alt}](${resolved})`;
  });

  // 12. Inline image URLs in plain text (not wrapped in ![])
  md = md.replace(/(https?:\/\/[^\s)]+?\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s)]*)?)/gi, (match) => {
    const resolved = resolveImageUrl(match, imageMap);
    return resolved !== match ? resolved : match;
  });

  // 13. Multiple consecutive blank lines → max two
  md = md.replace(/\n{3,}/g, "\n\n");

  // 14. Trailing whitespace on lines
  md = md.replace(/[ \t]+$/gm, "");

  return md.trim();
}

// ── Clean a full markdown packet (headers + body) ───────────────────────────
function cleanPacket(packet: string, imageMap: Map<string, string>): string {
  // Split at ## Body marker
  const bodyMarker = "\n## Body\n";
  const idx = packet.indexOf(bodyMarker);
  if (idx === -1) return cleanMarkdown(packet, imageMap);

  const header = packet.slice(0, idx + bodyMarker.length);
  const body   = packet.slice(idx + bodyMarker.length);

  // Also fix Featured Image URL in the header section
  const cleanedHeader = header.replace(
    /^(## Featured Image\n)(https?:\/\/[^\n]+)/m,
    (_, label, url) => `${label}${resolveImageUrl(url.trim(), imageMap)}`
  );

  return cleanedHeader + cleanMarkdown(body, imageMap);
}

// ── Copy images to public/legacy-blog/ ──────────────────────────────────────
async function copyImages(manifest: ImageManifestEntry[]) {
  await fs.ensureDir(IMG_DEST);
  let copied = 0, skipped = 0;

  for (const entry of manifest) {
    if (!entry.downloaded || !entry.localPath) continue;
    const srcFile  = path.join(process.cwd(), entry.localPath);
    const destFile = path.join(IMG_DEST, path.basename(entry.localPath));

    if (await fs.pathExists(destFile)) { skipped++; continue; }
    if (!(await fs.pathExists(srcFile))) continue;

    await fs.copy(srcFile, destFile);
    copied++;
  }

  console.log(`Images: ${copied} copied, ${skipped} already present in public/legacy-blog/`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Loading image manifest…");
  const manifest: ImageManifestEntry[] = await fs.pathExists(MANIFEST)
    ? await fs.readJson(MANIFEST)
    : [];

  const imageMap = buildImageMap(manifest);
  console.log(`Image map: ${imageMap.size} URL entries`);

  // Copy images to public/
  console.log("Copying images to public/legacy-blog/…");
  await copyImages(manifest);

  // Clean markdown files
  const mdFiles = (await fs.readdir(MD_DIR)).filter(f => f.endsWith(".md"));
  console.log(`Cleaning ${mdFiles.length} markdown files…`);

  let mdCleaned = 0;
  for (const file of mdFiles) {
    const filePath = path.join(MD_DIR, file);
    const original = await fs.readFile(filePath, "utf8");
    const cleaned  = cleanPacket(original, imageMap);
    if (cleaned !== original) {
      await fs.writeFile(filePath, cleaned, "utf8");
      mdCleaned++;
    }
  }
  console.log(`Markdown: ${mdCleaned}/${mdFiles.length} files updated`);

  // Clean JSON files — update bodyMarkdown and featuredImageUrl
  const jsonFiles = (await fs.readdir(JSON_DIR)).filter(f => f.endsWith(".json"));
  console.log(`Cleaning ${jsonFiles.length} JSON files…`);

  let jsonCleaned = 0;
  for (const file of jsonFiles) {
    const filePath = path.join(JSON_DIR, file);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const post: Record<string, any> = await fs.readJson(filePath);
    let changed = false;

    if (post.bodyMarkdown) {
      const cleaned = cleanMarkdown(post.bodyMarkdown, imageMap);
      if (cleaned !== post.bodyMarkdown) { post.bodyMarkdown = cleaned; changed = true; }
    }

    if (post.featuredImageUrl && post.featuredImageUrl.startsWith("http")) {
      const resolved = resolveImageUrl(post.featuredImageUrl, imageMap);
      if (resolved !== post.featuredImageUrl) { post.featuredImageUrl = resolved; changed = true; }
    }

    // Fix inline image URLs
    if (Array.isArray(post.inlineImages)) {
      for (const img of post.inlineImages) {
        if (img.src?.startsWith("http")) {
          const resolved = resolveImageUrl(img.src, imageMap);
          if (resolved !== img.src) { img.src = resolved; changed = true; }
        }
      }
    }

    if (changed) {
      await fs.writeJson(filePath, post, { spaces: 2 });
      jsonCleaned++;
    }
  }
  console.log(`JSON: ${jsonCleaned}/${jsonFiles.length} files updated`);
  console.log("Done.");
}

main().catch(err => { console.error(err); process.exit(1); });
