/**
 * AI-translated static UI strings persistence.
 *
 * locales/*.json is baked into the deployed bundle and read-only at runtime
 * on Vercel — there is no filesystem to write back to. These overrides live
 * in Supabase instead and get merged on top of the static English-sourced
 * JSON, both when the live site renders (lib/i18n/server.ts) and when the
 * admin translations page computes "missing" counts.
 */
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type LocaleOverrideMap = Record<string, string>; // dot-path key -> translated value

/** Fetch all overrides for one locale/namespace as a flat dot-path map. */
export async function getOverrides(locale: string, namespace: string): Promise<LocaleOverrideMap> {
  try {
    const db = getSupabaseAdminClient();
    const { data, error } = await db
      .from("locale_overrides")
      .select("key,value")
      .eq("locale", locale)
      .eq("namespace", namespace);
    if (error || !data) return {};
    return Object.fromEntries(data.map((row) => [row.key, row.value]));
  } catch {
    return {};
  }
}

/** Fetch overrides for every namespace of one locale in a single query. */
export async function getOverridesForLocale(locale: string): Promise<Record<string, LocaleOverrideMap>> {
  try {
    const db = getSupabaseAdminClient();
    const { data, error } = await db
      .from("locale_overrides")
      .select("namespace,key,value")
      .eq("locale", locale);
    if (error || !data) return {};
    const byNamespace: Record<string, LocaleOverrideMap> = {};
    for (const row of data) {
      byNamespace[row.namespace] ??= {};
      byNamespace[row.namespace][row.key] = row.value;
    }
    return byNamespace;
  } catch {
    return {};
  }
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

/** Deep-merge a flat dot-path override map onto a nested JSON object (does not mutate the input). */
export function applyOverrides<T extends Record<string, unknown>>(base: T, overrides: LocaleOverrideMap): T {
  if (Object.keys(overrides).length === 0) return base;
  const merged = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
  for (const [key, value] of Object.entries(overrides)) {
    setNestedValue(merged, key, value);
  }
  return merged as T;
}

/** Persist newly-translated keys for one locale/namespace. */
export async function saveOverrides(locale: string, namespace: string, kv: LocaleOverrideMap): Promise<void> {
  const rows = Object.entries(kv).map(([key, value]) => ({ locale, namespace, key, value }));
  if (rows.length === 0) return;
  const db = getSupabaseAdminClient();
  const { error } = await db.from("locale_overrides").upsert(rows, { onConflict: "locale,namespace,key" });
  if (error) throw error;
}
