/**
 * Admin API — Translation management
 *
 * GET  /api/admin/translations?tab=locales   → locale file completion status
 * GET  /api/admin/translations?tab=cms       → CMS translation_cache rows
 * POST /api/admin/translations               → action dispatcher
 *   { action: "auto-translate", locale, namespace }   → translate missing keys via Gemini
 *   { action: "export-task", locale, namespace? }      → return markdown task file
 *   { action: "cms-retrigger", documentId }            → re-trigger CMS translation
 *   { action: "cms-retrigger-all-stale" }              → re-trigger all stale CMS docs
 */

import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccessForEmail } from "@/lib/admin/users";
import { supportedLanguages, type SupportedLocale } from "@/lib/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { translateDocument } from "@/lib/translation/translate-document";

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const access = await getAdminAccessForEmail(user.email);
  return access ? user : null;
}

// ── Locale file helpers ───────────────────────────────────────────────────────

const LOCALES_DIR = path.join(process.cwd(), "locales");
const NON_ENGLISH = supportedLanguages.filter((l) => !l.isDefault && l.enabled).map((l) => l.id);

function loadJson(filePath: string): Record<string, unknown> {
  try { return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>; }
  catch { return {}; }
}

function countKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") keys.push(full);
    else if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...countKeys(v as Record<string, unknown>, full));
    }
  }
  return keys;
}

function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

function findMissingKeys(english: Record<string, unknown>, target: Record<string, unknown>): Record<string, string> {
  const missing: Record<string, string> = {};
  const allKeys = countKeys(english);
  for (const key of allKeys) {
    const enVal = getNestedValue(english, key) as string;
    const tVal = getNestedValue(target, key);
    if (!tVal || tVal === enVal) missing[key] = enVal;
  }
  return missing;
}

function getNamespaces(): string[] {
  const enDir = path.join(LOCALES_DIR, "en");
  if (!existsSync(enDir)) return [];
  return readdirSync(enDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}

export type LocaleFileStatus = {
  locale: string;
  localeName: string;
  namespace: string;
  total: number;
  translated: number;
  missing: number;
  pct: number;
};

function buildLocaleStatus(): LocaleFileStatus[] {
  const namespaces = getNamespaces();
  const result: LocaleFileStatus[] = [];
  for (const locale of NON_ENGLISH) {
    const langEntry = supportedLanguages.find((l) => l.id === locale)!;
    for (const ns of namespaces) {
      const enPath = path.join(LOCALES_DIR, "en", `${ns}.json`);
      const targetPath = path.join(LOCALES_DIR, locale, `${ns}.json`);
      const english = loadJson(enPath);
      const target = existsSync(targetPath) ? loadJson(targetPath) : {};
      const allKeys = countKeys(english);
      const missing = findMissingKeys(english, target);
      const total = allKeys.length;
      const missingCount = Object.keys(missing).length;
      result.push({
        locale,
        localeName: langEntry.title,
        namespace: ns,
        total,
        translated: total - missingCount,
        missing: missingCount,
        pct: total === 0 ? 100 : Math.round(((total - missingCount) / total) * 100),
      });
    }
  }
  return result;
}

// ── CMS helpers ───────────────────────────────────────────────────────────────

export type CmsDocRow = {
  source_document_id: string;
  source_document_type: string;
  source_slug: string;
  source_updated_at: string | null;
  locale: string;
  status: string;
  error_message: string | null;
  generated_at: string | null;
  updated_at: string;
};

async function listAllCmsRows(): Promise<CmsDocRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("translation_cache")
    .select("source_document_id,source_document_type,source_slug,source_updated_at,locale,status,error_message,generated_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CmsDocRow[];
}

// ── Gemini translation for locale files ───────────────────────────────────────

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

async function geminiTranslate(
  texts: Record<string, string>,
  targetLocale: SupportedLocale,
  apiKey: string,
): Promise<Record<string, string>> {
  const langEntry = supportedLanguages.find((l) => l.id === targetLocale)!;
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-flash-lite-latest",
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            `Translate the following JSON key-value pairs from English to ${langEntry.title}.`,
            "Return only a JSON object with the same keys and translated string values.",
            "Do not translate: JourneyLite, HIPAA, URLs, phone numbers, addresses, prices,",
            "medication brand names (Wegovy, Zepbound, Orbera, Spatz3, Allurion, Adipex),",
            "procedure acronyms (VSG, SADI, ESG), or physician names.",
            "Preserve {{interpolation}} placeholders exactly as-is.",
          ].join(" "),
        },
        { role: "user", content: JSON.stringify(texts) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from Gemini");
  return JSON.parse(content) as Record<string, string>;
}

function setNestedValue(obj: Record<string, unknown>, dotPath: string, value: string) {
  const parts = dotPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]!;
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]!] = value;
}

// ── CMS retrigger ─────────────────────────────────────────────────────────────

async function retriggerCmsDocument(documentId: string, apiKey: string) {
  const supabase = getSupabaseAdminClient();
  const { data: rows } = await supabase
    .from("translation_cache")
    .select("source_document_id,source_document_type,source_slug,source_updated_at")
    .eq("source_document_id", documentId)
    .limit(1);

  const existing = rows?.[0];
  if (!existing) throw new Error("Document not found in cache");

  await translateDocument(
    {
      _id: documentId,
      _type: existing.source_document_type as string,
      slug: { current: existing.source_slug as string },
      _updatedAt: existing.source_updated_at as string ?? undefined,
    },
    apiKey,
  );
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tab = request.nextUrl.searchParams.get("tab");

  if (tab === "cms") {
    const rows = await listAllCmsRows();
    return NextResponse.json({ rows });
  }

  // Default: locale file status
  const status = buildLocaleStatus();
  return NextResponse.json({ status });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    action: string;
    locale?: string;
    namespace?: string;
    documentId?: string;
  };

  const apiKey = process.env.GEMINI_API_KEY;

  // ── Export task file ──────────────────────────────────────────────────────
  if (body.action === "export-task") {
    const locale = body.locale;
    const ns = body.namespace;
    if (!locale) return NextResponse.json({ error: "locale required" }, { status: 400 });

    const langEntry = supportedLanguages.find((l) => l.id === locale);
    const langName = langEntry?.title ?? locale;
    const namespaces = ns ? [ns] : getNamespaces();
    const sections: string[] = [
      `# Translation task — ${langName} (${locale})`,
      `Generated: ${new Date().toISOString()}`,
      "",
      "Paste each section into your AI agent. Save each response to: locales/" + locale + "/<namespace>.json",
      "",
      "---",
      "",
    ];

    for (const namespace of namespaces) {
      const enPath = path.join(LOCALES_DIR, "en", `${namespace}.json`);
      const targetPath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      const english = loadJson(enPath);
      const target = existsSync(targetPath) ? loadJson(targetPath) : {};
      const missing = findMissingKeys(english, target);
      if (Object.keys(missing).length === 0) continue;

      sections.push(`## ${namespace}.json → ${langName}`);
      sections.push("");
      sections.push(`Translate from English to ${langName}. Return only JSON with the same keys.`);
      sections.push("Do NOT translate: JourneyLite, HIPAA, URLs, phone numbers, medication brand names, procedure acronyms, physician names. Preserve {{interpolation}} placeholders.");
      sections.push("");
      sections.push("```json");
      sections.push(JSON.stringify(missing, null, 2));
      sections.push("```");
      sections.push("");
      sections.push("---");
      sections.push("");
    }

    return NextResponse.json({ content: sections.join("\n") });
  }

  // ── Auto-translate locale file via Gemini ───────────────────────────────
  if (body.action === "auto-translate") {
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });

    const locale = body.locale as SupportedLocale;
    const ns = body.namespace;
    if (!locale || !ns) return NextResponse.json({ error: "locale and namespace required" }, { status: 400 });

    const enPath = path.join(LOCALES_DIR, "en", `${ns}.json`);
    const targetPath = path.join(LOCALES_DIR, locale, `${ns}.json`);
    const english = loadJson(enPath);
    const target = existsSync(targetPath) ? loadJson(targetPath) : {};
    const missing = findMissingKeys(english, target);

    if (Object.keys(missing).length === 0) {
      return NextResponse.json({ ok: true, translated: 0 });
    }

    const translated = await geminiTranslate(missing, locale, apiKey);

    // Merge translations into existing target
    const merged = { ...target };
    for (const [key, value] of Object.entries(translated)) {
      setNestedValue(merged as Record<string, unknown>, key, value);
    }

    const localeDir = path.join(LOCALES_DIR, locale);
    if (!existsSync(localeDir)) mkdirSync(localeDir, { recursive: true });
    writeFileSync(targetPath, JSON.stringify(merged, null, 2) + "\n", "utf-8");

    return NextResponse.json({ ok: true, translated: Object.keys(translated).length });
  }

  // ── CMS retrigger single document ─────────────────────────────────────────
  if (body.action === "cms-retrigger") {
    if (!body.documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    await retriggerCmsDocument(body.documentId, apiKey);
    return NextResponse.json({ ok: true });
  }

  // ── CMS retrigger all stale ────────────────────────────────────────────────
  if (body.action === "cms-retrigger-all-stale") {
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("translation_cache")
      .select("source_document_id")
      .eq("status", "stale");
    const ids = [...new Set((data ?? []).map((r) => r.source_document_id as string))];
    for (const id of ids) {
      try { await retriggerCmsDocument(id, apiKey); }
      catch (e) { console.error("[admin/translations] retrigger failed:", id, e); }
    }
    return NextResponse.json({ ok: true, retriggered: ids.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
