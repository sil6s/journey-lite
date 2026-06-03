#!/usr/bin/env tsx
/**
 * Exports all English locale JSON files into a single translation-task file
 * that you can paste directly into ChatGPT, Claude, or any AI agent.
 *
 * Usage:
 *   npx tsx scripts/export-for-translation.ts
 *   npx tsx scripts/export-for-translation.ts --namespace home  # single namespace
 *   npx tsx scripts/export-for-translation.ts --locale es       # single target locale
 *
 * Output:
 *   translation-tasks/task-<timestamp>.md   (one file per target locale, or filtered)
 *
 * Workflow:
 *   1. Run this script — it creates a task file in translation-tasks/
 *   2. Paste the task file contents into your AI agent
 *   3. Copy the AI agent's JSON response into the correct locales/<locale>/<ns>.json file
 *   4. Repeat per locale
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "fs";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const OUTPUT_DIR = path.join(process.cwd(), "translation-tasks");

const TARGET_LOCALES = ["es", "ar", "zh", "fr", "de", "vi", "hi", "ko", "ru"];

// Parse CLI flags
const nsFlag = process.argv.includes("--namespace")
  ? process.argv[process.argv.indexOf("--namespace") + 1]
  : null;
const localeFlag = process.argv.includes("--locale")
  ? process.argv[process.argv.indexOf("--locale") + 1]
  : null;

// Discover namespaces from the English locale directory
function getNamespaces(): string[] {
  const enDir = path.join(LOCALES_DIR, "en");
  if (!existsSync(enDir)) {
    console.error("No locales/en/ directory found. Create your English JSON files first.");
    process.exit(1);
  }
  return readdirSync(enDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .filter((ns) => !nsFlag || ns === nsFlag);
}

function loadJson(filePath: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// Find keys present in English but missing in target locale
function findMissingKeys(
  english: Record<string, unknown>,
  target: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const missing: Record<string, string> = {};
  for (const [key, value] of Object.entries(english)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      const targetValue = prefix
        ? getNestedValue(target, fullKey)
        : target[key];
      // Include if missing or still matches English exactly (not yet translated)
      if (!targetValue || targetValue === value) {
        missing[fullKey] = value;
      }
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const targetNested = (prefix ? getNestedValue(target, fullKey) : target[key]) ?? {};
      Object.assign(
        missing,
        findMissingKeys(
          value as Record<string, unknown>,
          targetNested as Record<string, unknown>,
          fullKey,
        ),
      );
    }
  }
  return missing;
}

function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

function buildTaskPrompt(locale: string, namespace: string, missing: Record<string, string>): string {
  const localeNames: Record<string, string> = {
    es: "Spanish", ar: "Arabic", zh: "Simplified Chinese",
    fr: "French", de: "German", vi: "Vietnamese",
    hi: "Hindi", ko: "Korean", ru: "Russian",
  };
  const langName = localeNames[locale] ?? locale;

  return [
    `## Translation task: ${namespace}.json → ${langName} (${locale})`,
    "",
    "Translate the following JSON key-value pairs from English to " + langName + ".",
    "Rules:",
    "- Keep the exact same JSON structure and keys",
    "- Do NOT translate: JourneyLite, HIPAA, URLs, phone numbers, addresses, prices,",
    "  medication brand names (Wegovy, Zepbound, Orbera, Spatz3, Allurion, Adipex),",
    "  procedure acronyms (VSG, SADI, ESG), or physician names",
    "- Preserve {{interpolation}} placeholders exactly as-is",
    "- Return ONLY the JSON object, no markdown code fences, no explanation",
    "",
    "English source:",
    "```json",
    JSON.stringify(missing, null, 2),
    "```",
    "",
    "Return the translated JSON object with the same keys:",
  ].join("\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────

mkdirSync(OUTPUT_DIR, { recursive: true });

const namespaces = getNamespaces();
const locales = localeFlag ? [localeFlag] : TARGET_LOCALES;
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

let totalMissing = 0;
let filesCreated = 0;

for (const locale of locales) {
  const sections: string[] = [
    `# Translation tasks for locale: ${locale}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "Paste each section into your AI agent one at a time.",
    "Save each response to: locales/" + locale + "/<namespace>.json",
    "",
    "---",
    "",
  ];

  let localeMissing = 0;

  for (const ns of namespaces) {
    const englishPath = path.join(LOCALES_DIR, "en", `${ns}.json`);
    const targetPath = path.join(LOCALES_DIR, locale, `${ns}.json`);

    const english = loadJson(englishPath);
    const target = existsSync(targetPath) ? loadJson(targetPath) : {};

    const missing = findMissingKeys(english, target);
    const count = Object.keys(missing).length;

    if (count === 0) {
      console.log(`  ✓  ${locale}/${ns}.json — already complete`);
      continue;
    }

    console.log(`  ⚠  ${locale}/${ns}.json — ${count} keys need translation`);
    localeMissing += count;
    totalMissing += count;

    sections.push(buildTaskPrompt(locale, ns, missing));
    sections.push("\n---\n");
  }

  if (localeMissing > 0) {
    const outputPath = path.join(OUTPUT_DIR, `task-${locale}-${timestamp}.md`);
    writeFileSync(outputPath, sections.join("\n"), "utf-8");
    console.log(`  → Wrote: translation-tasks/task-${locale}-${timestamp}.md`);
    filesCreated++;
  }
}

console.log(`\nDone. ${totalMissing} total keys need translation across ${filesCreated} task files.`);

if (filesCreated > 0) {
  console.log("\nNext steps:");
  console.log("  1. Open each translation-tasks/task-<locale>-*.md file");
  console.log("  2. Paste each section into your AI agent (ChatGPT, Claude, etc.)");
  console.log("  3. Copy the returned JSON into locales/<locale>/<namespace>.json");
  console.log("  4. Re-run this script to check what's still missing");
}
