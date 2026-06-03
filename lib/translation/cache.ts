/**
 * Translation cache — Supabase CRUD layer.
 *
 * All functions use the service-role client (bypasses RLS).
 * Server-only — never import from client components.
 */
import { createHash } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupportedLocale } from "@/lib/i18n/config";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TranslationStatus =
  | "pending"
  | "translating"
  | "complete"
  | "error"
  | "stale";

export type CachedTranslation = {
  id: string;
  source_document_id: string;
  source_document_type: string;
  source_revision_id: string | null;
  source_updated_at: string | null;
  source_slug: string;
  source_content_hash: string;
  locale: string;
  translated_title: string | null;
  translated_slug: string | null;
  translated_excerpt: string | null;
  translated_body: unknown | null;
  translated_seo_title: string | null;
  translated_seo_description: string | null;
  translated_faqs: unknown | null;
  translated_ctas: unknown | null;
  translated_image_alts: unknown | null;
  status: TranslationStatus;
  error_message: string | null;
  translation_provider: string;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

// ── Content hashing ───────────────────────────────────────────────────────────

/**
 * Short SHA-256 of only the fields that affect translation output.
 * Changing non-translatable fields (author, publishedAt, etc.) won't
 * trigger a re-translation.
 */
export function hashSourceContent(doc: Record<string, unknown>): string {
  const relevant = {
    title: doc.title,
    body: doc.body,
    excerpt: doc.excerpt,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    heroHeadline: doc.heroHeadline,
    heroSubheadline: doc.heroSubheadline,
    sections: doc.sections,
    faqs: doc.faqs,
  };
  return createHash("sha256")
    .update(JSON.stringify(relevant))
    .digest("hex")
    .slice(0, 24);
}

// ── Distributed-lock helpers ──────────────────────────────────────────────────

/**
 * How long a "translating" row is considered valid before it's treated as
 * stuck and we allow a retry. 5 minutes is generous for any real translation.
 */
const TRANSLATING_TIMEOUT_MS = 5 * 60 * 1_000;

/**
 * Returns true when the DB shows an in-progress translation that started
 * recently. Used to prevent duplicate work across Vercel instances.
 */
export async function isDistributedTranslationInProgress(
  documentId: string,
  locale: SupportedLocale,
): Promise<boolean> {
  const row = await getCacheRow(documentId, locale);
  if (!row || row.status !== "translating") return false;
  const age = Date.now() - new Date(row.updated_at).getTime();
  return age < TRANSLATING_TIMEOUT_MS;
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Returns a fresh completed translation, or null if:
 *  - not found
 *  - content hash has changed (auto-marks stale)
 *  - status is not "complete"
 */
export async function getCachedTranslation(
  documentId: string,
  locale: SupportedLocale,
  currentHash: string,
): Promise<CachedTranslation | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("translation_cache")
    .select("*")
    .eq("source_document_id", documentId)
    .eq("locale", locale)
    .maybeSingle();

  if (error) {
    console.error("[cache] Read error:", error.message);
    return null;
  }
  if (!data) return null;

  // Hash mismatch — source has been updated
  if (data.source_content_hash !== currentHash) {
    void setStatus(documentId, locale, "stale"); // async, don't block the response
    return null;
  }

  return data.status === "complete" ? (data as CachedTranslation) : null;
}

/**
 * Returns a stale-but-existing translation to serve while a re-translation
 * is triggered in the background (stale-while-revalidate pattern).
 */
export async function getStaleCachedTranslation(
  documentId: string,
  locale: SupportedLocale,
): Promise<CachedTranslation | null> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("translation_cache")
    .select("*")
    .eq("source_document_id", documentId)
    .eq("locale", locale)
    .in("status", ["complete", "stale"])
    .maybeSingle();
  return (data as CachedTranslation) ?? null;
}

/**
 * Raw row regardless of status — used by the admin translation endpoint.
 */
export async function getCacheRow(
  documentId: string,
  locale: SupportedLocale,
): Promise<CachedTranslation | null> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("translation_cache")
    .select("*")
    .eq("source_document_id", documentId)
    .eq("locale", locale)
    .maybeSingle();
  return (data as CachedTranslation) ?? null;
}

/**
 * All cache rows for a document, ordered by locale.
 * Used by admin UI to display translation status per locale.
 */
export async function listTranslationsForDocument(
  documentId: string,
): Promise<CachedTranslation[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("translation_cache")
    .select("*")
    .eq("source_document_id", documentId)
    .order("locale");
  if (error) throw error;
  return (data ?? []) as CachedTranslation[];
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function upsertCacheRow(
  row: Partial<CachedTranslation> & {
    source_document_id: string;
    locale: string;
    source_content_hash: string;
    source_slug: string;
    source_document_type: string;
  },
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("translation_cache")
    .upsert(
      { ...row, updated_at: new Date().toISOString() },
      { onConflict: "source_document_id,locale" },
    );
  if (error) {
    console.error("[cache] Upsert error:", error.message);
    throw new Error(`Cache upsert failed: ${error.message}`);
  }
}

/**
 * Save a completed translation. `provider` defaults to "deepseek".
 */
export async function saveTranslation(
  documentId: string,
  locale: SupportedLocale,
  payload: {
    sourceDocumentType: string;
    sourceRevisionId: string | null;
    sourceUpdatedAt: string | null;
    sourceSlug: string;
    sourceContentHash: string;
    translatedTitle: string | null;
    translatedExcerpt: string | null;
    translatedBody: unknown | null;
    translatedSeoTitle: string | null;
    translatedSeoDescription: string | null;
    translatedFaqs: unknown | null;
    translatedCtas: unknown | null;
    translatedImageAlts: Record<string, string> | null;
    provider?: string;
  },
): Promise<void> {
  await upsertCacheRow({
    source_document_id: documentId,
    source_document_type: payload.sourceDocumentType,
    source_revision_id: payload.sourceRevisionId,
    source_updated_at: payload.sourceUpdatedAt,
    source_slug: payload.sourceSlug,
    source_content_hash: payload.sourceContentHash,
    locale,
    translated_title: payload.translatedTitle,
    translated_slug: payload.sourceSlug, // slug stays English across all locales
    translated_excerpt: payload.translatedExcerpt,
    translated_body: payload.translatedBody ?? null,
    translated_seo_title: payload.translatedSeoTitle,
    translated_seo_description: payload.translatedSeoDescription,
    translated_faqs: payload.translatedFaqs ?? null,
    translated_ctas: payload.translatedCtas ?? null,
    translated_image_alts: payload.translatedImageAlts ?? null,
    status: "complete",
    error_message: null,
    translation_provider: payload.provider ?? "deepseek",
    generated_at: new Date().toISOString(),
  });
}

/**
 * Mark a document's translations as stale for ALL non-English locales.
 * Called by the Sanity webhook when a document is updated.
 */
export async function invalidateTranslationsForDocument(
  documentId: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("translation_cache")
    .update({ status: "stale", updated_at: new Date().toISOString() })
    .eq("source_document_id", documentId)
    .neq("locale", "en"); // never touch English rows
  if (error) console.error("[cache] Invalidate error:", error.message);
}

export async function markTranslationError(
  documentId: string,
  locale: SupportedLocale,
  errorMessage: string,
): Promise<void> {
  await setStatus(documentId, locale, "error", errorMessage);
}

export async function deleteTranslationCache(
  documentId: string,
  locale?: SupportedLocale,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  let q = supabase
    .from("translation_cache")
    .delete()
    .eq("source_document_id", documentId);
  if (locale) q = q.eq("locale", locale) as typeof q;
  const { error } = await q;
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function setStatus(
  documentId: string,
  locale: string,
  status: TranslationStatus,
  errorMessage?: string,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase
    .from("translation_cache")
    .update({
      status,
      ...(errorMessage !== undefined ? { error_message: errorMessage } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("source_document_id", documentId)
    .eq("locale", locale);
}
