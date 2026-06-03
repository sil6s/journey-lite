/**
 * Sanity publish webhook — translates CMS documents when they're published.
 *
 * Configure in Sanity > API > Webhooks:
 *   URL: https://<your-domain>/api/webhooks/sanity-translate
 *   Trigger on: Create, Update  (filter: _type in ["blogPost", "sitePage", "post"])
 *   HTTP method: POST
 *   Secret: set SANITY_WEBHOOK_SECRET in your env
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { TRANSLATABLE_TYPES, translateDocument, type TranslatableDoc } from "@/lib/translation/translate-document";

export const maxDuration = 60;

function verifySignature(body: string, signatureHeader: string | null): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signatureHeader, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("sanity-webhook-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Translation service not configured." }, { status: 503 });

  let doc: TranslatableDoc;
  try { doc = JSON.parse(rawBody) as TranslatableDoc; }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  if (!TRANSLATABLE_TYPES.has(doc._type)) {
    return NextResponse.json({ skipped: true, reason: "Document type not translatable." });
  }

  await translateDocument(doc, apiKey);
  return NextResponse.json({ ok: true, documentId: doc._id });
}
