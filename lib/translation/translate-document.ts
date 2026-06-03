/**
 * Core CMS document translation logic.
 * Shared by the Sanity webhook and the admin retrigger API.
 */

import { supportedLanguages, type SupportedLocale } from "@/lib/i18n/config";
import {
  hashSourceContent,
  getCachedTranslation,
  upsertCacheRow,
  saveTranslation,
  markTranslationError,
  isDistributedTranslationInProgress,
} from "@/lib/translation/cache";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

export const TRANSLATABLE_TYPES = new Set(["blogPost", "sitePage", "post"]);

export const TARGET_LOCALES = supportedLanguages
  .filter((l) => !l.isDefault && l.enabled)
  .map((l) => l.id);

export type TranslatableDoc = {
  _id: string;
  _type: string;
  _rev?: string;
  _updatedAt?: string;
  slug?: { current?: string };
  title?: string;
  excerpt?: string;
  body?: unknown;
  seoTitle?: string;
  seoDescription?: string;
  faqs?: Array<{ question: string; answer: string }>;
  ctas?: Array<{ label: string; href?: string }>;
};

type TranslatedFields = {
  title: string | null;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  faqs: Array<{ question: string; answer: string }> | null;
  ctas: Array<{ label: string; href?: string }> | null;
};

async function translateFields(
  doc: TranslatableDoc,
  locale: SupportedLocale,
  apiKey: string,
): Promise<TranslatableDoc & TranslatedFields> {
  const language = supportedLanguages.find((l) => l.id === locale)!.title;

  const payload: Record<string, string> = {};
  if (doc.title) payload.title = doc.title;
  if (doc.excerpt) payload.excerpt = doc.excerpt;
  if (doc.seoTitle) payload.seoTitle = doc.seoTitle;
  if (doc.seoDescription) payload.seoDescription = doc.seoDescription;
  doc.faqs?.forEach((faq, i) => {
    payload[`faq_q_${i}`] = faq.question;
    payload[`faq_a_${i}`] = faq.answer;
  });
  doc.ctas?.forEach((cta, i) => { payload[`cta_label_${i}`] = cta.label; });

  if (Object.keys(payload).length === 0) {
    return { ...doc, title: null, excerpt: null, seoTitle: null, seoDescription: null, faqs: null, ctas: null };
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            `Translate the following JSON fields from English to ${language}.`,
            "Return only a JSON object with the same keys and translated string values.",
            "Do not translate: JourneyLite, HIPAA, URLs, phone numbers, addresses, prices,",
            "medication brand names (Wegovy, Zepbound, Orbera, Spatz3, Allurion, Adipex),",
            "procedure acronyms (VSG, SADI, ESG), or physician names.",
            "Preserve HTML tags if present. Keep translations concise and medically accurate.",
          ].join(" "),
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from DeepSeek");

  const translated = JSON.parse(content) as Record<string, string>;

  return {
    ...doc,
    title: translated.title ?? null,
    excerpt: translated.excerpt ?? null,
    seoTitle: translated.seoTitle ?? null,
    seoDescription: translated.seoDescription ?? null,
    faqs: doc.faqs?.map((faq, i) => ({
      question: translated[`faq_q_${i}`] ?? faq.question,
      answer: translated[`faq_a_${i}`] ?? faq.answer,
    })) ?? null,
    ctas: doc.ctas?.map((cta, i) => ({ ...cta, label: translated[`cta_label_${i}`] ?? cta.label })) ?? null,
  };
}

async function translateOneLocale(
  doc: TranslatableDoc,
  locale: SupportedLocale,
  slug: string,
  contentHash: string,
  apiKey: string,
) {
  const cached = await getCachedTranslation(doc._id, locale, contentHash);
  if (cached) return;

  if (await isDistributedTranslationInProgress(doc._id, locale)) return;

  await upsertCacheRow({
    source_document_id: doc._id,
    source_document_type: doc._type,
    source_revision_id: doc._rev ?? null,
    source_updated_at: doc._updatedAt ?? null,
    source_slug: slug,
    source_content_hash: contentHash,
    locale,
    status: "translating",
    translation_provider: "deepseek",
  });

  const translated = await translateFields(doc, locale, apiKey);

  await saveTranslation(doc._id, locale, {
    sourceDocumentType: doc._type,
    sourceRevisionId: doc._rev ?? null,
    sourceUpdatedAt: doc._updatedAt ?? null,
    sourceSlug: slug,
    sourceContentHash: contentHash,
    translatedTitle: translated.title,
    translatedExcerpt: translated.excerpt,
    translatedBody: doc.body ? (doc.body as Parameters<typeof saveTranslation>[2]["translatedBody"]) : null,
    translatedSeoTitle: translated.seoTitle,
    translatedSeoDescription: translated.seoDescription,
    translatedFaqs: translated.faqs ? (translated.faqs as Parameters<typeof saveTranslation>[2]["translatedFaqs"]) : null,
    translatedCtas: translated.ctas ? (translated.ctas as Parameters<typeof saveTranslation>[2]["translatedCtas"]) : null,
    translatedImageAlts: null,
    provider: "deepseek",
  });
}

/** Translate a document into all enabled non-English locales in parallel. */
export async function translateDocument(
  doc: TranslatableDoc,
  apiKey: string,
) {
  const slug = doc.slug?.current ?? doc._id;
  const contentHash = hashSourceContent(doc as Record<string, unknown>);

  const results = await Promise.allSettled(
    (TARGET_LOCALES as SupportedLocale[]).map((locale) =>
      translateOneLocale(doc, locale, slug, contentHash, apiKey),
    ),
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected") {
      const locale = TARGET_LOCALES[i] as SupportedLocale;
      const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error(`[translate-document] Failed ${doc._id} → ${locale}:`, message);
      await markTranslationError(doc._id, locale, message);
    }
  }
}
