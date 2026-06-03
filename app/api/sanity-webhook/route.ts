/**
 * Sanity webhook handler — translation cache invalidation.
 *
 * Sanity calls this endpoint whenever a document is published or updated.
 * We mark all non-English translation cache rows for that document as "stale"
 * so they'll be re-translated on the next page view.
 *
 * Setup in Sanity:
 *   Dashboard → API → Webhooks → Create webhook
 *   URL:     https://journeylite.com/api/sanity-webhook
 *   Trigger: Publish
 *   Filter:  _type in ["blogPost","post","sitePage","testimonial"]
 *   Secret:  (same value as SANITY_WEBHOOK_SECRET env var)
 *   HTTP method: POST
 *
 * The webhook secret is verified via HMAC-SHA256 so only genuine Sanity
 * events can invalidate the cache.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { invalidateTranslationsForDocument } from "@/lib/translation/cache";

// ── HMAC verification ─────────────────────────────────────────────────────────

async function verifySignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    // No secret configured — allow in development, reject in production
    if (process.env.NODE_ENV === "production") {
      console.error("[sanity-webhook] SANITY_WEBHOOK_SECRET is not set — rejecting request.");
      return false;
    }
    console.warn("[sanity-webhook] SANITY_WEBHOOK_SECRET not set — skipping verification (dev mode).");
    return true;
  }

  const signature = request.headers.get("sanity-webhook-signature");
  if (!signature) return false;

  // Sanity sends: "t=<timestamp>,v1=<hmac>"
  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [k, v] = part.split("=");
      return [k, v];
    }),
  );
  const timestamp = parts["t"];
  const receivedHmac = parts["v1"];
  if (!timestamp || !receivedHmac) return false;

  // Prevent replay attacks — reject payloads older than 5 minutes
  const age = Date.now() - Number(timestamp) * 1_000;
  if (age > 5 * 60 * 1_000) {
    console.warn("[sanity-webhook] Rejecting stale webhook (age:", age, "ms)");
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(receivedHmac, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// ── Webhook payload type ──────────────────────────────────────────────────────

type SanityWebhookPayload = {
  _id?: string;
  _type?: string;
  _rev?: string;
  [key: string]: unknown;
};

// Document types that have CMS-generated translations
const TRANSLATABLE_TYPES = new Set([
  "blogPost",
  "post",
  "sitePage",
  "testimonial",
]);

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Read raw body for HMAC verification (must happen before parsing)
  const rawBody = await request.text();

  const isValid = await verifySignature(request, rawBody);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: SanityWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SanityWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const documentId = payload._id;
  const documentType = payload._type;

  if (!documentId) {
    return NextResponse.json({ error: "Missing _id in payload." }, { status: 400 });
  }

  // Only invalidate translatable document types
  if (documentType && !TRANSLATABLE_TYPES.has(documentType)) {
    return NextResponse.json({
      ok: true,
      message: `Ignored document type: ${documentType}`,
    });
  }

  try {
    await invalidateTranslationsForDocument(documentId);
    console.info(
      `[sanity-webhook] Invalidated translations for ${documentType ?? "unknown"} ${documentId}`,
    );
    return NextResponse.json({
      ok: true,
      documentId,
      documentType,
      message: "Translation cache marked stale — will re-translate on next page view.",
    });
  } catch (err) {
    console.error("[sanity-webhook] Error invalidating cache:", err);
    return NextResponse.json(
      { error: "Cache invalidation failed." },
      { status: 500 },
    );
  }
}
