#!/usr/bin/env tsx
/**
 * Patches all drafts.jl-blog-* documents in Sanity with { isMigrated: true }.
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local or the shell environment.
 *
 * Run: npm run patch:migrated
 */

import { createClient } from "@sanity/client";

const PROJECT_ID = process.env.SANITY_PROJECT_ID ?? "44pkofuy";
const DATASET    = process.env.SANITY_DATASET ?? "production";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;

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

async function main() {
  console.log(`Querying drafts.jl-blog-* documents in ${PROJECT_ID}/${DATASET}…`);

  // Fetch all migrated draft IDs
  const ids: string[] = await client.fetch(
    `*[_type == "blogPost" && string::startsWith(_id, "drafts.jl-blog-")]._id`
  );

  console.log(`Found ${ids.length} draft documents to patch.`);

  if (!ids.length) {
    console.log("Nothing to patch. Run the import script first.");
    return;
  }

  // Patch in batches of 100 (Sanity transaction limit)
  const BATCH = 100;
  let patched = 0;

  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const tx = client.transaction();
    for (const id of batch) {
      tx.patch(id, { set: { isMigrated: true } });
    }
    await tx.commit({ visibility: "async" });
    patched += batch.length;
    console.log(`  Patched ${patched}/${ids.length}…`);
  }

  console.log(`Done. ${patched} documents patched with isMigrated: true.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
