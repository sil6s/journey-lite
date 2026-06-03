/**
 * AI translation orchestrator — DeepSeek backend.
 *
 * Flow per request:
 *  1. Compute content hash → check Supabase cache
 *  2. Cache hit (hash matches, status=complete) → return immediately
 *  3. Cache miss / stale:
 *     a. Check DB for distributed in-progress lock (prevents duplicate work
 *        across Vercel instances)
 *     b. Acquire in-process lock (prevents duplicate work within this instance)
 *     c. Double-check cache after lock (another request may have just finished)
 *     d. Mark DB status="translating"
 *     e. Call DeepSeek — one batched request for all flat fields + PT text map
 *     f. Save to cache with status="complete"
 *  4. On error → mark status="error", return null (caller falls back to English)
 *
 * DeepSeek API is OpenAI-compatible and supports `response_format: json_object`,
 * which guarantees valid JSON output — no code-fence stripping needed.
 *
 * All API calls are server-side. DEEPSEEK_API_KEY never reaches the browser.
 */

import {
  getCachedTranslation,
  getStaleCachedTranslation,
  hashSourceContent,
  isDistributedTranslationInProgress,
  markTranslationError,
  saveTranslation,
  upsertCacheRow,
  type CachedTranslation,
} from "./cache";
import {
  applyTranslationsToBlocks,
  chunkTextMap,
  extractTranslatableTexts,
  type PortableTextBlock,
} from "./portable-text";
import { acquireAiCallSlot, acquireTranslationLock } from "./rate-limiter";
import { getLanguageEntry, type SupportedLocale } from "@/lib/i18n/config";
import type { Json } from "@/lib/supabase/database.types";

// ── DeepSeek config ───────────────────────────────────────────────────────────

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat"; // DeepSeek-V3: best quality, very cheap
const MAX_TOKENS = 8192;
const TEMPERATURE = 0.1; // Low = consistent, deterministic translation

function asJson(value: unknown): Json {
  return value as Json;
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(targetLanguage: string): string {
  return `You are a professional medical translator for JourneyLite, a bariatric and medical weight loss practice in the United States. Translate content to ${targetLanguage}.

STRICT RULES:
1. Preserve exact medical meaning — never add claims, never remove information.
2. Do not make outcomes sound guaranteed or better than stated.
3. Never alter eligibility criteria, risks, benefits, pricing, insurance language, or disclaimers.
4. Keep CTAs semantically identical — only translate the visible text.
5. Never translate: JourneyLite, ORBERA, Allurion, Spatz3, Wegovy, Zepbound, Adipex, Contrave, VSG, SADI, ESG, Dr. Curry, Dr. Augusta, HIPAA.
6. Never translate: phone numbers (877-442-2263), addresses, URLs, IDs.
7. Tone: professional, warm, clear, patient-friendly.
8. The English version is always the official source.

You MUST respond with valid JSON only — no explanations, no markdown.`;
}

// ── Document type ─────────────────────────────────────────────────────────────

export type TranslatableSanityDoc = {
  _id: string;
  _type: string;
  _rev?: string;
  _updatedAt?: string;
  title?: string;
  slug?: { current: string };
  excerpt?: string;
  body?: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  sections?: PortableTextBlock[];
  faqs?: Array<{ question?: string; answer?: string; [k: string]: unknown }>;
  [key: string]: unknown;
};

export type TranslationResult = {
  /** null means "use English fallback" */
  translation: CachedTranslation | null;
  fromCache: boolean;
  isSourceLanguage: boolean;
  /** true when serving stale content while background re-translation runs */
  isStale: boolean;
};

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Returns a translated Sanity document for `locale`, creating it if needed.
 *
 * Callers should:
 *   const { translation, isSourceLanguage, isStale } = await getOrCreateTranslation(doc, locale)
 *   const title = translation?.translated_title ?? doc.title
 *   const body  = translation?.translated_body  ?? doc.body
 *   // Show <TranslationDisclaimer> when !isSourceLanguage && !!translation
 */
export async function getOrCreateTranslation(
  doc: TranslatableSanityDoc,
  locale: SupportedLocale,
  options: { forceRefresh?: boolean } = {},
): Promise<TranslationResult> {
  if (locale === "en") {
    return { translation: null, fromCache: false, isSourceLanguage: true, isStale: false };
  }

  const hash = hashSourceContent(doc as Record<string, unknown>);
  const slug = doc.slug?.current ?? doc._id;

  // ── 1. Fresh cache hit ────────────────────────────────────────────────────
  if (!options.forceRefresh) {
    const cached = await getCachedTranslation(doc._id, locale, hash);
    if (cached) {
      return { translation: cached, fromCache: true, isSourceLanguage: false, isStale: false };
    }
  }

  // ── 2. Distributed in-progress check (multi-instance Vercel) ─────────────
  // If another instance just started translating this doc, serve stale content
  // immediately rather than spinning up a duplicate translation.
  if (!options.forceRefresh) {
    const inProgress = await isDistributedTranslationInProgress(doc._id, locale);
    if (inProgress) {
      const stale = await getStaleCachedTranslation(doc._id, locale);
      return {
        translation: stale,
        fromCache: !!stale,
        isSourceLanguage: false,
        isStale: true,
      };
    }
  }

  // ── 3. Acquire in-process lock ────────────────────────────────────────────
  const release = await acquireTranslationLock(doc._id, locale);
  try {
    // Double-check after lock — another request in this process may have finished
    if (!options.forceRefresh) {
      const cached = await getCachedTranslation(doc._id, locale, hash);
      if (cached) {
        return { translation: cached, fromCache: true, isSourceLanguage: false, isStale: false };
      }
    }

    // Mark DB as translating so other Vercel instances see the lock
    await upsertCacheRow({
      source_document_id: doc._id,
      source_document_type: doc._type,
      source_revision_id: doc._rev ?? null,
      source_updated_at: doc._updatedAt ?? null,
      source_slug: slug,
      source_content_hash: hash,
      locale,
      status: "translating",
    });

    // ── 4. Run AI translation ───────────────────────────────────────────────
    const translated = await runTranslation(doc, locale);

    await saveTranslation(doc._id, locale, {
      sourceDocumentType: doc._type,
      sourceRevisionId: doc._rev ?? null,
      sourceUpdatedAt: doc._updatedAt ?? null,
      sourceSlug: slug,
      sourceContentHash: hash,
      translatedTitle: translated.title ?? null,
      translatedExcerpt: translated.excerpt ?? null,
      translatedBody: translated.body ? asJson(translated.body) : null,
      translatedSeoTitle: translated.seoTitle ?? null,
      translatedSeoDescription: translated.seoDescription ?? null,
      translatedFaqs: translated.faqs ? asJson(translated.faqs) : null,
      translatedCtas: translated.ctas ? asJson(translated.ctas) : null,
      translatedImageAlts: translated.imageAlts ?? null,
    });

    const saved = await getCachedTranslation(doc._id, locale, hash);
    return { translation: saved, fromCache: false, isSourceLanguage: false, isStale: false };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[translate] ${doc._id} → ${locale}:`, msg);
    await markTranslationError(doc._id, locale, msg).catch(() => {});
    // Serve stale if we have it, otherwise null (English fallback)
    const stale = await getStaleCachedTranslation(doc._id, locale);
    return { translation: stale, fromCache: !!stale, isSourceLanguage: false, isStale: true };
  } finally {
    release();
  }
}

// ── Translation orchestration ─────────────────────────────────────────────────

type TranslatedFields = {
  title?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  body?: PortableTextBlock[];
  faqs?: Array<{ question: string; answer: string }>;
  ctas?: Array<{ label: string; url?: string }>;
  imageAlts?: Record<string, string>;
};

async function runTranslation(
  doc: TranslatableSanityDoc,
  locale: SupportedLocale,
): Promise<TranslatedFields> {
  const lang = getLanguageEntry(locale);
  const result: TranslatedFields = {};

  const releaseSlot = await acquireAiCallSlot();
  try {
    // ── Flat fields ─────────────────────────────────────────────────────────
    const flat: Record<string, string> = {};
    if (doc.title) flat.title = doc.title;
    if (doc.excerpt) flat.excerpt = doc.excerpt;
    if (doc.seoTitle) flat.seoTitle = doc.seoTitle;
    if (doc.seoDescription) flat.seoDescription = doc.seoDescription;
    if (doc.heroHeadline) flat.heroHeadline = doc.heroHeadline;
    if (doc.heroSubheadline) flat.heroSubheadline = doc.heroSubheadline;

    // ── PT / sections text map ───────────────────────────────────────────────
    const blocks = (doc.body ?? doc.sections) as PortableTextBlock[] | undefined;
    const ptEntries = Array.isArray(blocks) ? extractTranslatableTexts(blocks) : [];

    // ── FAQs ─────────────────────────────────────────────────────────────────
    const faqItems = Array.isArray(doc.faqs)
      ? (doc.faqs as Array<Record<string, unknown>>).map((f) => ({
          question: String(f.question ?? ""),
          answer: String(f.answer ?? ""),
        }))
      : [];

    // ── Batch: combine flat fields + first PT chunk into one API call ────────
    const ptChunks = chunkTextMap(ptEntries);
    const firstChunk = ptChunks[0] ?? {};

    if (Object.keys(flat).length > 0 || Object.keys(firstChunk).length > 0 || faqItems.length > 0) {
      const payload: {
        fields?: Record<string, string>;
        ptTexts?: Record<string, string>;
        faqs?: Array<{ question: string; answer: string }>;
      } = {};
      if (Object.keys(flat).length > 0) payload.fields = flat;
      if (Object.keys(firstChunk).length > 0) payload.ptTexts = firstChunk;
      if (faqItems.length > 0) payload.faqs = faqItems;

      const response = await callDeepSeek<typeof payload>(
        buildSystemPrompt(lang.title),
        `Translate the following JSON to ${lang.title}. Translate ONLY the string values in "fields", the string values in "ptTexts" (keys are structural paths — do not change them), and the "question"/"answer" strings in "faqs". Return JSON with the same structure.\n\n${JSON.stringify(payload)}`,
      );

      if (response.fields) Object.assign(result, response.fields);
      if (response.ptTexts && blocks) {
        result.body = applyTranslationsToBlocks(blocks, response.ptTexts);
      }
      if (response.faqs) result.faqs = response.faqs;
    }

    // ── Remaining PT chunks (large documents) ────────────────────────────────
    if (ptChunks.length > 1 && blocks) {
      const remainingTranslated = { ...extractPtTextsMap(result.body ?? blocks) };

      for (const chunk of ptChunks.slice(1)) {
        const chunkResponse = await callDeepSeek<{ ptTexts: Record<string, string> }>(
          buildSystemPrompt(lang.title),
          `Translate the string values in this JSON path map to ${lang.title}. Do not change the keys.\n\n${JSON.stringify({ ptTexts: chunk })}`,
        );
        if (chunkResponse.ptTexts) {
          Object.assign(remainingTranslated, chunkResponse.ptTexts);
        }
      }

      result.body = applyTranslationsToBlocks(blocks, remainingTranslated);
    }

  } finally {
    releaseSlot();
  }

  return result;
}

/** Helper to build a full PT text map from translated blocks for merging. */
function extractPtTextsMap(blocks: PortableTextBlock[]): Record<string, string> {
  const entries = extractTranslatableTexts(blocks);
  return Object.fromEntries(entries.map((e) => [e.path, e.text]));
}

// ── DeepSeek API call ─────────────────────────────────────────────────────────

async function callDeepSeek<T>(system: string, user: string): Promise<T> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set.");

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      // json_object mode guarantees valid JSON output — no post-processing needed
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(45_000), // 45s — generous for large docs
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek ${response.status}: ${body.slice(0, 300)}`);
  }

  type DeepSeekResponse = {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };

  const data = (await response.json()) as DeepSeekResponse;
  const text = data.choices[0]?.message?.content ?? "";

  if (data.usage) {
    console.debug(
      `[translate/deepseek] tokens in=${data.usage.prompt_tokens} out=${data.usage.completion_tokens}`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`DeepSeek returned invalid JSON. Preview: ${text.slice(0, 200)}`);
  }
}
