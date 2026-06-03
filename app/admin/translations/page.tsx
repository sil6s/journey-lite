import type { Metadata } from "next";
import { TranslationsManager } from "@/components/admin/translations-manager";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { supportedLanguages } from "@/lib/i18n/config";
import type { LocaleFileStatus, CmsDocRow } from "@/app/api/admin/translations/route";

export const metadata: Metadata = {
  title: "Translations — JourneyLite Admin",
};

// ── Locale file status ────────────────────────────────────────────────────────

const LOCALES_DIR = path.join(process.cwd(), "locales");
const NON_ENGLISH = supportedLanguages.filter((l) => !l.isDefault && l.enabled).map((l) => l.id);

function loadJson(filePath: string): Record<string, unknown> {
  try { return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>; }
  catch { return {}; }
}

function countLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") keys.push(full);
    else if (v && typeof v === "object" && !Array.isArray(v))
      keys.push(...countLeafKeys(v as Record<string, unknown>, full));
  }
  return keys;
}

function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

function buildLocaleStatus(): LocaleFileStatus[] {
  const enDir = path.join(LOCALES_DIR, "en");
  if (!existsSync(enDir)) return [];
  const namespaces = readdirSync(enDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

  const result: LocaleFileStatus[] = [];
  for (const locale of NON_ENGLISH) {
    const langEntry = supportedLanguages.find((l) => l.id === locale)!;
    for (const ns of namespaces) {
      const english = loadJson(path.join(LOCALES_DIR, "en", `${ns}.json`));
      const targetPath = path.join(LOCALES_DIR, locale, `${ns}.json`);
      const target = existsSync(targetPath) ? loadJson(targetPath) : {};
      const allKeys = countLeafKeys(english);
      const missingCount = allKeys.filter((k) => {
        const enVal = getNestedValue(english, k) as string;
        const tVal = getNestedValue(target, k);
        return !tVal || tVal === enVal;
      }).length;
      const total = allKeys.length;
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

// ── CMS rows ──────────────────────────────────────────────────────────────────

async function fetchCmsRows(): Promise<CmsDocRow[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("translation_cache")
      .select("source_document_id,source_document_type,source_slug,source_updated_at,locale,status,error_message,generated_at,updated_at")
      .order("updated_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as CmsDocRow[];
  } catch {
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TranslationsPage() {
  const [localeStatus, cmsRows] = await Promise.all([
    Promise.resolve(buildLocaleStatus()),
    fetchCmsRows(),
  ]);

  return <TranslationsManager localeStatus={localeStatus} cmsRows={cmsRows} />;
}
