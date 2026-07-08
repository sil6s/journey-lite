import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

const FMLA_FORM_KEY = "fmla-short-term-disability-paperwork";
const SUBMISSION_ID_PROPERTY = "_journeylite_form_submission_id";
const FORM_KEY_PROPERTY = "_journeylite_form_key";

type ShopifyLineItemProperty = {
  name?: string;
  key?: string;
  value?: string | number | null;
};

type ShopifyLineItem = {
  title?: string;
  name?: string;
  product_title?: string;
  variant_title?: string;
  sku?: string;
  properties?: ShopifyLineItemProperty[];
};

type ShopifyOrderPayload = {
  id?: number;
  admin_graphql_api_id?: string;
  name?: string;
  order_number?: number;
  email?: string | null;
  contact_email?: string | null;
  created_at?: string;
  total_price?: string;
  currency?: string;
  customer?: {
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  billing_address?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  line_items?: ShopifyLineItem[];
};

type FormSubmissionRow = {
  id: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!verifyShopifyWebhook(body, req.headers.get("x-shopify-hmac-sha256"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(body) as ShopifyOrderPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const lineItem = order.line_items?.find(isFmlaLineItem);
  if (!lineItem) {
    return NextResponse.json({ ok: true, ignored: "No FMLA paperwork line item." });
  }

  const directSubmissionId = propertyValue(lineItem, SUBMISSION_ID_PROPERTY);
  const match = directSubmissionId ? await findSubmissionById(directSubmissionId) : await findSubmissionByOrder(order);
  if (!match) {
    console.warn("[shopify-orders-paid] No matching FMLA submission found for order:", order.name || order.id);
    return NextResponse.json({ ok: true, matched: false });
  }

  await markSubmissionPaid(match, order, lineItem, Boolean(directSubmissionId));
  return NextResponse.json({ ok: true, matched: true, submissionId: match.id });
}

function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    console.error("[shopify-orders-paid] SHOPIFY_WEBHOOK_SECRET is not configured.");
    return false;
  }
  if (!hmacHeader) return false;

  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(hmacHeader, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function isFmlaLineItem(lineItem: ShopifyLineItem) {
  if (propertyValue(lineItem, FORM_KEY_PROPERTY) === FMLA_FORM_KEY) return true;
  const haystack = [
    lineItem.title,
    lineItem.name,
    lineItem.product_title,
    lineItem.variant_title,
    lineItem.sku,
  ].filter(Boolean).join(" ").toLowerCase();
  return /fmla|short-term|disability|paperwork/.test(haystack);
}

function propertyValue(lineItem: ShopifyLineItem, key: string) {
  const property = lineItem.properties?.find((item) => item.name === key || item.key === key);
  return property?.value == null ? undefined : String(property.value);
}

async function findSubmissionById(id: string): Promise<FormSubmissionRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("id,data,metadata")
    .eq("id", id)
    .eq("form_key", FMLA_FORM_KEY)
    .maybeSingle();

  if (error) {
    console.error("[shopify-orders-paid] Direct submission lookup failed:", error);
    return null;
  }
  return normalizeSubmission(data);
}

async function findSubmissionByOrder(order: ShopifyOrderPayload): Promise<FormSubmissionRow | null> {
  const email = order.email || order.contact_email || order.customer?.email || null;
  if (!email) return null;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("id,data,metadata")
    .eq("form_key", FMLA_FORM_KEY)
    .order("submitted_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[shopify-orders-paid] Fallback submission lookup failed:", error);
    return null;
  }

  const orderName = normalizeName(
    order.customer?.first_name || order.billing_address?.first_name,
    order.customer?.last_name || order.billing_address?.last_name
  );

  const rows = (data ?? []).map(normalizeSubmission).filter((row): row is FormSubmissionRow => Boolean(row));
  return rows.find((row) => {
    const submissionEmail = String(row.data.email ?? "").trim().toLowerCase();
    if (submissionEmail !== email.trim().toLowerCase()) return false;
    const submissionName = normalizeName(row.data.firstName, row.data.lastName);
    return !orderName || !submissionName || orderName === submissionName;
  }) ?? null;
}

async function markSubmissionPaid(submission: FormSubmissionRow, order: ShopifyOrderPayload, lineItem: ShopifyLineItem, matchedById: boolean) {
  const supabase = getSupabaseAdminClient();
  const metadata = {
    ...(submission.metadata ?? {}),
    shopifyPayment: {
      matchedAt: new Date().toISOString(),
      matchedBy: matchedById ? "submission_id" : "email_name_fallback",
      orderId: order.id ? String(order.id) : null,
      orderGid: order.admin_graphql_api_id ?? null,
      orderName: order.name ?? (order.order_number ? `#${order.order_number}` : null),
      orderEmail: order.email || order.contact_email || order.customer?.email || null,
      totalPrice: order.total_price ?? null,
      currency: order.currency ?? null,
      lineItemTitle: lineItem.title || lineItem.name || lineItem.product_title || "FMLA paperwork fee",
    },
  };

  const { error } = await supabase
    .from("form_submissions")
    .update({ metadata: metadata as Json })
    .eq("id", submission.id);

  if (error) {
    console.error("[shopify-orders-paid] Could not mark FMLA submission paid:", error);
  }
}

function normalizeSubmission(value: unknown): FormSubmissionRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { id?: unknown; data?: unknown; metadata?: unknown };
  if (typeof row.id !== "string" || !row.data || typeof row.data !== "object" || Array.isArray(row.data)) return null;
  return {
    id: row.id,
    data: row.data as Record<string, unknown>,
    metadata: row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ? row.metadata as Record<string, unknown> : null,
  };
}

function normalizeName(firstName: unknown, lastName: unknown) {
  return [firstName, lastName]
    .map((part) => String(part ?? "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");
}
