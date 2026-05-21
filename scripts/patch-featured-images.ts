#!/usr/bin/env tsx
/**
 * Patches all migrated Sanity drafts to ensure:
 *   1. featuredImageAlt is set (auto-generated from title if missing)
 *   2. featuredImage is set (uploads healthy-stock.jpg as placeholder for posts with no image)
 *
 * Run: npm run patch:featured-images
 */

import fs from "fs-extra";
import path from "path";
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
  projectId: PROJECT_ID,
  dataset:   DATASET,
  apiVersion: "2024-01-01",
  token:      TOKEN,
  useCdn:     false,
});

const JSON_DIR      = path.join(process.cwd(), "migration/journeylite-blog/json");
const PLACEHOLDER   = path.join(process.cwd(), "public/healthy-stock.jpg");

function draftId(slug: string) {
  return `drafts.jl-blog-${slug}`.slice(0, 128);
}

function makeAlt(post: NormalizedPost): string {
  if (post.featuredImageAlt?.trim()) return post.featuredImageAlt.trim();
  // Auto-generate from title — descriptive enough for a11y, user can refine later
  const title = post.title?.trim() || "JourneyLite article";
  return `${title} | JourneyLite`;
}

async function uploadPlaceholder(): Promise<string> {
  console.log("Uploading placeholder image (healthy-stock.jpg)…");
  const stream = fs.createReadStream(PLACEHOLDER);
  const asset = await client.assets.upload("image", stream, {
    filename: "journeylite-blog-placeholder.jpg",
    contentType: "image/jpeg",
  });
  console.log(`  Placeholder asset: ${asset._id}`);
  return asset._id;
}

async function main() {
  const jsonFiles = (await fs.readdir(JSON_DIR)).filter(f => f.endsWith(".json"));
  console.log(`Processing ${jsonFiles.length} posts…`);

  // Upload placeholder once — used for posts with no featured image
  let placeholderRef: string | null = null;

  let altPatched = 0, imgPatched = 0, errors = 0;
  const BATCH = 100;
  let queue: Array<{ id: string; patch: Record<string, unknown> }> = [];

  async function flushQueue() {
    if (!queue.length) return;
    const tx = client.transaction();
    for (const { id, patch } of queue) {
      tx.patch(id, { set: patch });
    }
    await tx.commit({ visibility: "async" });
    queue = [];
  }

  for (const file of jsonFiles) {
    const post = await fs.readJson(path.join(JSON_DIR, file)) as NormalizedPost;
    const id = draftId(post.slug);
    const alt = makeAlt(post);
    const hasFeaturedImage = post.featuredImageUrl?.startsWith("/legacy-blog/");

    const patch: Record<string, unknown> = { featuredImageAlt: alt };
    altPatched++;

    if (!hasFeaturedImage) {
      // Upload placeholder on first need
      if (!placeholderRef) {
        try {
          placeholderRef = await uploadPlaceholder();
        } catch (err) {
          console.error(`Failed to upload placeholder: ${err}`);
          errors++;
        }
      }
      if (placeholderRef) {
        patch.featuredImage = {
          _type: "image",
          asset: { _type: "reference", _ref: placeholderRef },
        };
        imgPatched++;
      }
    }

    queue.push({ id, patch });

    if (queue.length >= BATCH) {
      try {
        await flushQueue();
        process.stdout.write(`  Patched ${altPatched}/${jsonFiles.length}…\r`);
      } catch (err) {
        console.error(`\nBatch patch error: ${err}`);
        errors++;
        queue = [];
      }
    }
  }

  // Flush remaining
  try {
    await flushQueue();
  } catch (err) {
    console.error(`Final batch error: ${err}`);
    errors++;
  }

  console.log(`\nDone.`);
  console.log(`  Alt text patched:   ${altPatched} documents`);
  console.log(`  Placeholder image:  ${imgPatched} documents`);
  console.log(`  Errors:             ${errors}`);
}

main().catch(err => { console.error(err); process.exit(1); });
