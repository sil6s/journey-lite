#!/usr/bin/env tsx
/**
 * Generates stub locale JSON files for all languages that don't yet have them.
 * Stubs contain the same content as English — a placeholder until AI translation runs.
 *
 * Usage:
 *   npx tsx scripts/generate-locale-stubs.ts
 *   npx tsx scripts/generate-locale-stubs.ts --locale ar   # only Arabic
 *   npx tsx scripts/generate-locale-stubs.ts --dry-run
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const NAMESPACES = ["common", "navigation", "forms", "calculators", "footer", "disclaimers"];
// Languages that already have full translations — skip these
const SKIP_LOCALES = ["en", "es", "ar"];

// Optionally filter to a single locale via --locale flag
const targetLocale = process.argv.includes("--locale")
  ? process.argv[process.argv.indexOf("--locale") + 1]
  : null;
const dryRun = process.argv.includes("--dry-run");

const targetLocales = ["zh", "fr", "de", "vi", "hi", "ko", "ru"].filter(
  (l) => !targetLocale || l === targetLocale
);

let created = 0;
let skipped = 0;

for (const locale of targetLocales) {
  const localeDir = path.join(LOCALES_DIR, locale);
  if (!dryRun && !existsSync(localeDir)) {
    mkdirSync(localeDir, { recursive: true });
  }

  for (const ns of NAMESPACES) {
    const targetPath = path.join(localeDir, `${ns}.json`);
    const englishPath = path.join(LOCALES_DIR, "en", `${ns}.json`);

    if (existsSync(targetPath)) {
      console.log(`  ⏭  Skipping existing: ${locale}/${ns}.json`);
      skipped++;
      continue;
    }

    if (!existsSync(englishPath)) {
      console.warn(`  ⚠  Missing English source: en/${ns}.json`);
      continue;
    }

    const englishContent = readFileSync(englishPath, "utf-8");
    if (!dryRun) {
      writeFileSync(targetPath, englishContent, "utf-8");
    }
    console.log(`  ✅ ${dryRun ? "[dry-run] " : ""}Created: ${locale}/${ns}.json`);
    created++;
  }
}

console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
console.log(
  "\n💡 Next step: run the AI translation endpoint to fill in real translations:\n" +
  "   POST /api/translate/batch  { locales: ['zh','fr','de','vi','hi','ko','ru'] }"
);
