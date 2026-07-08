import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteProps) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = (await req.json()) as {
    orderName?: string;
    orderEmail?: string;
    totalPrice?: string;
    currency?: string;
    orderId?: string;
  };

  const orderName = String(body.orderName ?? "").trim();
  if (!orderName) {
    return NextResponse.json({ error: "Shopify order number is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: submission, error: fetchError } = await supabase
    .from("form_submissions")
    .select("metadata")
    .eq("id", id)
    .eq("form_key", "fmla-short-term-disability-paperwork")
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!submission) return NextResponse.json({ error: "FMLA submission not found." }, { status: 404 });

  const existingMetadata = submission.metadata && typeof submission.metadata === "object" && !Array.isArray(submission.metadata)
    ? submission.metadata as Record<string, unknown>
    : {};

  const metadata = {
    ...existingMetadata,
    shopifyPayment: {
      matchedAt: new Date().toISOString(),
      matchedBy: "manual_admin",
      orderId: String(body.orderId ?? "").trim() || null,
      orderGid: null,
      orderName,
      orderEmail: String(body.orderEmail ?? "").trim() || null,
      totalPrice: String(body.totalPrice ?? "").trim() || null,
      currency: String(body.currency ?? "").trim() || "USD",
      lineItemTitle: "FMLA paperwork fee",
    },
  };

  const { error } = await supabase
    .from("form_submissions")
    .update({ metadata: metadata as Json })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, metadata });
}
