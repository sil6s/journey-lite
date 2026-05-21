import fs from "fs-extra";
import path from "path";
import https from "https";
import http from "http";
import { URL } from "url";

export interface ImageManifestEntry {
  originalUrl: string;
  localPath: string | null;
  alt: string;
  caption: string;
  postSlug: string;
  downloaded: boolean;
  error: string | null;
  sensitiveMedicalImage: boolean;
  suggestedAlt: string;
}

const IMAGES_DIR = path.join(process.cwd(), "migration/journeylite-blog/images");
const MANIFEST_PATH = path.join(process.cwd(), "migration/journeylite-blog/reports/image-manifest.json");

const SENSITIVE_PATTERNS = [
  /before.{0,10}after/i,
  /transformation/i,
  /weight.?loss.?result/i,
  /surgery.?result/i,
];

function isSensitive(alt: string, src: string): boolean {
  return SENSITIVE_PATTERNS.some((p) => p.test(alt) || p.test(src));
}

function filenameFromUrl(url: string, postSlug: string): string {
  try {
    const u = new URL(url);
    const basename = path.basename(u.pathname).replace(/[^a-zA-Z0-9._-]/g, "-");
    return `${postSlug}__${basename}`;
  } catch {
    return `${postSlug}__image-${Date.now()}.jpg`;
  }
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    proto
      .get(url, { timeout: 15000 }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.remove(dest).then(() => downloadFile(res.headers.location!, dest).then(resolve).catch(reject));
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.remove(dest).catch(() => null);
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
        file.on("error", (err) => { file.close(); fs.remove(dest).catch(() => null); reject(err); });
      })
      .on("error", (err) => { file.close(); fs.remove(dest).catch(() => null); reject(err); })
      .on("timeout", () => { reject(new Error("Download timeout")); });
  });
}

export async function downloadImage(
  url: string,
  alt: string,
  caption: string,
  postSlug: string
): Promise<ImageManifestEntry> {
  await fs.ensureDir(IMAGES_DIR);
  const filename = filenameFromUrl(url, postSlug);
  const localPath = path.join(IMAGES_DIR, filename);
  const relativePath = `migration/journeylite-blog/images/${filename}`;
  const sensitive = isSensitive(alt, url);
  const suggestedAlt = alt || `Image from ${postSlug} article`;

  const entry: ImageManifestEntry = {
    originalUrl: url,
    localPath: relativePath,
    alt,
    caption,
    postSlug,
    downloaded: false,
    error: null,
    sensitiveMedicalImage: sensitive,
    suggestedAlt,
  };

  // Skip if already downloaded
  if (await fs.pathExists(localPath)) {
    entry.downloaded = true;
    return entry;
  }

  try {
    await downloadFile(url, localPath);
    entry.downloaded = true;
  } catch (err) {
    entry.downloaded = false;
    entry.localPath = null;
    entry.error = err instanceof Error ? err.message : String(err);
  }

  return entry;
}

export async function loadManifest(): Promise<ImageManifestEntry[]> {
  if (await fs.pathExists(MANIFEST_PATH)) {
    return await fs.readJson(MANIFEST_PATH);
  }
  return [];
}

export async function saveManifest(entries: ImageManifestEntry[]): Promise<void> {
  await fs.ensureDir(path.dirname(MANIFEST_PATH));
  await fs.writeJson(MANIFEST_PATH, entries, { spaces: 2 });
}

export async function appendToManifest(newEntries: ImageManifestEntry[]): Promise<void> {
  const existing = await loadManifest();
  const urlSet = new Set(existing.map((e) => e.originalUrl));
  const merged = [...existing, ...newEntries.filter((e) => !urlSet.has(e.originalUrl))];
  await saveManifest(merged);
}
