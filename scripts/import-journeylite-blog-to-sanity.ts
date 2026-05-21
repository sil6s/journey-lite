#!/usr/bin/env tsx
/**
 * Imports crawled JourneyLite blog posts into Sanity as drafts.
 *
 * Usage:
 *   npm run import:journeylite-blog -- --dry-run
 *   npm run import:journeylite-blog -- --limit 5
 *   npm run import:journeylite-blog -- --slug some-post-slug
 *   npm run import:journeylite-blog -- --create-drafts
 *   npm run import:journeylite-blog -- --update-existing
 *
 * Required env vars:
 *   SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION, SANITY_WRITE_TOKEN
 */

import fs from "fs-extra";
import path from "path";
import { createClient } from "@sanity/client";
import { mapToSanityDraft } from "../lib/migration/journeylite/mapToSanity";
import type { NormalizedPost } from "../lib/migration/journeylite/normalizePost";

// ── Env / config ─────────────────────────────────────────────────────────────
const PROJECT_ID =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const DATASET =
  process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION =
  process.env.SANITY_API_VERSION ||
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  "2025-05-05";
const WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN || "";

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

const DRY_RUN = args.includes("--dry-run");
const UPDATE_EXISTING = args.includes("--update-existing");
const POST_LIMIT_ARG = getArg("--limit");
const POST_LIMIT = POST_LIMIT_ARG ? parseInt(POST_LIMIT_ARG, 10) : Infinity;
const targetSlug = getArg("--slug");

// ── Paths ─────────────────────────────────────────────────────────────────────
const JSON_DIR = path.join(process.cwd(), "migration/journeylite-blog/json");
const REPORTS_DIR = path.join(process.cwd(), "migration/journeylite-blog/reports");
const IMPORT_REPORT_PATH = path.join(REPORTS_DIR, "import-report.json");

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function draftId(slug: string): string {
  return `drafts.jl-blog-${slug}`;
}

function publishedId(slug: string): string {
  return `jl-blog-${slug}`;
}

// ── Import report ─────────────────────────────────────────────────────────────
interface ImportResult {
  slug: string;
  title: string;
  action: "created" | "skipped" | "updated" | "failed";
  reason?: string;
  sanityId?: string;
}
const results: ImportResult[] = [];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!DRY_RUN && !WRITE_TOKEN) {
    console.error(
      "ERROR: SANITY_WRITE_TOKEN is not set. Export it as an environment variable.\n" +
        "Get a token from: https://www.sanity.io/manage → project → API → Tokens"
    );
    process.exit(1);
  }

  if (!PROJECT_ID) {
    console.error("ERROR: SANITY_PROJECT_ID is not set.");
    process.exit(1);
  }

  const sanity = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token: WRITE_TOKEN,
    useCdn: false,
  });

  // Load JSON exports
  if (!(await fs.pathExists(JSON_DIR))) {
    console.error(`JSON export directory not found: ${JSON_DIR}\nRun crawl first.`);
    process.exit(1);
  }

  let files = (await fs.readdir(JSON_DIR)).filter((f) => f.endsWith(".json"));
  if (targetSlug) {
    files = files.filter((f) => f === `${targetSlug}.json`);
    if (files.length === 0) {
      console.error(`No JSON found for slug: ${targetSlug}`);
      process.exit(1);
    }
  }
  if (POST_LIMIT < Infinity) {
    files = files.slice(0, POST_LIMIT);
  }

  log(`${DRY_RUN ? "[DRY RUN] " : ""}Importing ${files.length} posts into Sanity`);
  log(`Project: ${PROJECT_ID} / ${DATASET}`);

  for (const file of files) {
    const post: NormalizedPost = await fs.readJson(path.join(JSON_DIR, file));
    const slug = post.slug;

    const draft = mapToSanityDraft(post);
    const docId = draftId(slug);

    if (DRY_RUN) {
      log(`[DRY RUN] Would create draft: ${docId} — "${post.title}"`);
      results.push({ slug, title: post.title, action: "skipped", reason: "dry-run" });
      continue;
    }

    // Check for existing document
    const existingDraft = await sanity.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{_id}`,
      { id: docId }
    );
    const existingPublished = await sanity.fetch<{ _id: string } | null>(
      `*[_id == $id][0]{_id}`,
      { id: publishedId(slug) }
    );

    if ((existingDraft || existingPublished) && !UPDATE_EXISTING) {
      log(`Skipping existing: ${slug}`);
      results.push({ slug, title: post.title, action: "skipped", reason: "already exists", sanityId: docId });
      continue;
    }

    try {
      const doc = {
        ...draft,
        _id: docId,
      };

      // Remove _migration from the Sanity doc (not in schema) — log it separately
      const { _migration, ...sanityDoc } = doc as typeof doc & { _migration?: unknown };

      if (existingDraft && UPDATE_EXISTING) {
        await sanity.createOrReplace(sanityDoc as Parameters<typeof sanity.createOrReplace>[0]);
        log(`Updated draft: ${docId}`);
        results.push({ slug, title: post.title, action: "updated", sanityId: docId });
      } else {
        await sanity.create(sanityDoc as Parameters<typeof sanity.create>[0]);
        log(`Created draft: ${docId}`);
        results.push({ slug, title: post.title, action: "created", sanityId: docId });
      }
    } catch (err) {
      log(`FAILED to import ${slug}: ${err}`);
      results.push({ slug, title: post.title, action: "failed", reason: String(err) });
    }
  }

  // Save import report
  await fs.ensureDir(REPORTS_DIR);
  const report = {
    runAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    total: results.length,
    created: results.filter((r) => r.action === "created").length,
    updated: results.filter((r) => r.action === "updated").length,
    skipped: results.filter((r) => r.action === "skipped").length,
    failed: results.filter((r) => r.action === "failed").length,
    results,
  };
  await fs.writeJson(IMPORT_REPORT_PATH, report, { spaces: 2 });
  log(`Import complete. Report: ${IMPORT_REPORT_PATH}`);
  log(
    `Created: ${report.created} | Updated: ${report.updated} | Skipped: ${report.skipped} | Failed: ${report.failed}`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
