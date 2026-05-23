#!/usr/bin/env tsx
/**
 * Uploads migrated blog images to Sanity and patches featuredImage on each draft.
 *
 * For each drafts.jl-blog-* document whose featuredImage is missing:
 *   1. Reads the featuredImageUrl from the local JSON file
 *   2. Maps /legacy-blog/filename → migration/journeylite-blog/images/filename
 *   3. Uploads the file to Sanity's asset pipeline
 *   4. Patches featuredImage + featuredImageAlt on the draft document
 *
 * Run: npm run upload:images
 */

import fs from "fs-extra";
import path from "path";
const mime = require("mime-types") as { lookup: (path: string) => string | false };
import { createClient } from "@sanity/client";
import type { NormalizedPost } from "../lib/migration/journeylite/normalizePost";

const PROJECT_ID = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "44pkofuy";
const DATASET    = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

if (!TOKEN) {
  console.error("Error: SANITY_API_WRITE_TOKEN is not set.");
  process.exit(1);
}

const client = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  apiVersion: "2024-01-01",
  token:      TOKEN,
  useCdn:     false,
});

const JSON_DIR   = path.join(process.cwd(), "migration/journeylite-blog/json");
const IMAGES_DIR = path.join(process.cwd(), "migration/journeylite-blog/images");

function legacyUrlToFilePath(legacyUrl: string): string | null {
  // /legacy-blog/filename.ext → IMAGES_DIR/filename.ext
  if (!legacyUrl.startsWith("/legacy-blog/")) return null;
  const filename = path.basename(legacyUrl);
  return path.join(IMAGES_DIR, filename);
}

async function main() {
  const jsonFiles = (await fs.readdir(JSON_DIR)).filter(f => f.endsWith(".json"));
  console.log(`Processing ${jsonFiles.length} posts…`);

  let uploaded = 0, patched = 0, skipped = 0, missing = 0, errors = 0;

  // Cache: assetRef by filename to avoid re-uploading the same image
  const assetCache = new Map<string, string>();

  for (const file of jsonFiles) {
    const post = await fs.readJson(path.join(JSON_DIR, file)) as NormalizedPost;
    const slug = post.slug;
    const draftId = `drafts.jl-blog-${slug}`.slice(0, 128);

    const featuredUrl = post.featuredImageUrl;
    if (!featuredUrl || !featuredUrl.startsWith("/legacy-blog/")) {
      skipped++;
      continue;
    }

    const filePath = legacyUrlToFilePath(featuredUrl);
    if (!filePath || !(await fs.pathExists(filePath))) {
      console.warn(`  Missing image file for ${slug}: ${featuredUrl}`);
      missing++;
      continue;
    }

    const filename = path.basename(filePath);
    let assetRef = assetCache.get(filename);

    if (!assetRef) {
      try {
        const contentType = mime.lookup(filePath) || "image/jpeg";
        const stream = fs.createReadStream(filePath);
        const asset = await client.assets.upload("image", stream, {
          filename,
          contentType,
        });
        assetRef = asset._id;
        assetCache.set(filename, assetRef);
        uploaded++;
        if (uploaded % 25 === 0) console.log(`  Uploaded ${uploaded} images…`);
      } catch (err) {
        console.error(`  Upload failed for ${filename}: ${err}`);
        errors++;
        continue;
      }
    }

    try {
      const patch: Record<string, unknown> = {
        featuredImage: {
          _type: "image",
          asset: { _type: "reference", _ref: assetRef },
        },
      };
      if (post.featuredImageAlt) patch.featuredImageAlt = post.featuredImageAlt;

      await client.patch(draftId).set(patch).commit({ visibility: "async" });
      patched++;
    } catch (err) {
      console.error(`  Patch failed for ${slug}: ${err}`);
      errors++;
    }
  }

  console.log(`\nDone.`);
  console.log(`  Uploaded: ${uploaded} images`);
  console.log(`  Patched:  ${patched} documents`);
  console.log(`  Skipped:  ${skipped} (no legacy-blog URL)`);
  console.log(`  Missing:  ${missing} (file not found)`);
  console.log(`  Errors:   ${errors}`);
}

main().catch(err => { console.error(err); process.exit(1); });
