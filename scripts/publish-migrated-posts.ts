#!/usr/bin/env tsx
/**
 * Publishes all drafts.jl-blog-* documents in Sanity.
 * For each draft: creates the published document (without drafts. prefix) and deletes the draft.
 * Continues on individual failures — logs them at the end.
 *
 * Run: npm run publish:migrated
 */

import { createClient } from "@sanity/client";

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

const BATCH = 40; // mutations per transaction (40 pairs = 80 mutations, well under 1000 limit)

async function main() {
  console.log("Fetching all drafts.jl-blog-* documents…");

  // Fetch in two pages to stay under GROQ result limits
  const page1 = await client.fetch<Record<string, unknown>[]>(
    `*[_type == "blogPost" && string::startsWith(_id, "drafts.jl-blog-")][0..249]`
  );
  const page2 = await client.fetch<Record<string, unknown>[]>(
    `*[_type == "blogPost" && string::startsWith(_id, "drafts.jl-blog-")][250..499]`
  );
  const drafts = [...page1, ...page2];

  console.log(`Found ${drafts.length} draft documents to publish.`);

  let published = 0;
  const failures: { id: string; error: string }[] = [];

  for (let i = 0; i < drafts.length; i += BATCH) {
    const batch = drafts.slice(i, i + BATCH);
    const tx = client.transaction();

    for (const draft of batch) {
      const draftId = draft._id as string;
      const publishedId = draftId.replace(/^drafts\./, "");

      // Strip Sanity-internal fields before publishing
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, _rev, ...content } = draft;

      tx.createOrReplace({ ...content, _id: publishedId } as Parameters<typeof tx.createOrReplace>[0]);
      tx.delete(draftId);
    }

    try {
      await tx.commit({ visibility: "async" });
      published += batch.length;
      console.log(`  Published ${published}/${drafts.length}…`);
    } catch (batchErr) {
      // Batch failed — try each document individually so one bad doc doesn't block others
      console.warn(`  Batch ${i}–${i + batch.length} failed, retrying individually…`);
      for (const draft of batch) {
        const draftId = draft._id as string;
        const publishedId = draftId.replace(/^drafts\./, "");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, _rev, ...content } = draft;
        try {
          const singleTx = client.transaction();
          singleTx.createOrReplace({ ...content, _id: publishedId } as Parameters<typeof singleTx.createOrReplace>[0]);
          singleTx.delete(draftId);
          await singleTx.commit({ visibility: "async" });
          published++;
        } catch (singleErr) {
          failures.push({ id: draftId, error: String(singleErr) });
        }
      }
    }
  }

  console.log(`\nDone.`);
  console.log(`  Published: ${published}`);
  console.log(`  Failed:    ${failures.length}`);
  if (failures.length) {
    console.log("\nFailed documents:");
    for (const f of failures) console.log(`  ${f.id}: ${f.error}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
