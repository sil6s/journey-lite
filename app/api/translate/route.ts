/**
 * Admin-protected translation management endpoint.
 *
 * GET  /api/translate?documentId=…            → per-locale status for a document
 * POST /api/translate                          → trigger or force-refresh translation
 * DELETE /api/translate?documentId=…&locale=… → clear cache row(s)
 */
import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { client } from "@/src/lib/sanity/client";
import {
  deleteTranslationCache,
  listTranslationsForDocument,
} from "@/lib/translation/cache";
import { getOrCreateTranslation } from "@/lib/translation/translate";
import {
  isValidLocale,
  publicLocales,
  type SupportedLocale,
} from "@/lib/i18n/config";

// ── GET — translation status ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const documentId = request.nextUrl.searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required." }, { status: 400 });
  }

  try {
    const rows = await listTranslationsForDocument(documentId);
    const byLocale = Object.fromEntries(
      rows.map((r) => [
        r.locale,
        {
          status: r.status,
          generatedAt: r.generated_at,
          hash: r.source_content_hash,
          provider: r.translation_provider,
          error: r.error_message ?? undefined,
        },
      ]),
    );

    // Pad with "none" for locales that have no row yet
    for (const locale of publicLocales) {
      if (!byLocale[locale]) byLocale[locale] = { status: "none" };
    }

    return NextResponse.json({ documentId, translations: byLocale });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ── POST — trigger translation ────────────────────────────────────────────────

type TranslateBody = {
  documentId: string;
  /** "all" = every non-English locale; otherwise a specific locale ID */
  locale?: SupportedLocale | "all";
  /** true = bypass hash check and re-translate even if cache is current */
  forceRefresh?: boolean;
};

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: TranslateBody;
  try {
    body = (await request.json()) as TranslateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { documentId, locale = "all", forceRefresh = false } = body;
  if (!documentId) {
    return NextResponse.json({ error: "documentId is required." }, { status: 400 });
  }

  // Fetch the source document from Sanity
  const doc = await client.fetch<Record<string, unknown> | null>(
    `*[_id == $id][0]`,
    { id: documentId },
    { next: { revalidate: 0 } },
  );

  if (!doc) {
    return NextResponse.json({ error: "Sanity document not found." }, { status: 404 });
  }

  const targetLocales: SupportedLocale[] =
    locale === "all"
      ? (publicLocales.filter((l) => l !== "en") as SupportedLocale[])
      : isValidLocale(locale)
      ? [locale as SupportedLocale]
      : [];

  if (targetLocales.length === 0) {
    return NextResponse.json({ error: `Invalid locale: "${locale}"` }, { status: 400 });
  }

  // Process locales sequentially (respects the AI concurrency semaphore)
  const results: Record<string, string> = {};

  for (const targetLocale of targetLocales) {
    try {
      const { fromCache, translation, isStale } = await getOrCreateTranslation(
        doc as Parameters<typeof getOrCreateTranslation>[0],
        targetLocale,
        { forceRefresh },
      );

      if (!translation) results[targetLocale] = "error — no translation produced";
      else if (isStale) results[targetLocale] = "stale_served";
      else if (fromCache) results[targetLocale] = "cache_hit";
      else results[targetLocale] = "translated";
    } catch (err) {
      results[targetLocale] = `error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return NextResponse.json({ documentId, results });
}

// ── DELETE — clear cache ──────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const documentId = request.nextUrl.searchParams.get("documentId");
  const locale = request.nextUrl.searchParams.get("locale");

  if (!documentId) {
    return NextResponse.json({ error: "documentId is required." }, { status: 400 });
  }

  const targetLocale =
    locale && isValidLocale(locale) ? (locale as SupportedLocale) : undefined;

  try {
    await deleteTranslationCache(documentId, targetLocale);
    return NextResponse.json({
      ok: true,
      message: targetLocale
        ? `Cleared cache for ${documentId}/${targetLocale}`
        : `Cleared all cache rows for ${documentId}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
