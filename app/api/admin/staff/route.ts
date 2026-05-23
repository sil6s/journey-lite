import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminClient } from "@/src/lib/sanity/client";
import { requireAdmin } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  if (!process.env.SANITY_API_WRITE_TOKEN && !process.env.SANITY_WRITE_TOKEN) {
    return NextResponse.json({ error: "Missing Sanity write token." }, { status: 500 });
  }

  const body = (await request.json()) as { id?: string; sourceId?: string; fields?: Record<string, string> };
  const fields = body.fields ?? {};
  if (!fields.name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const slug = slugify(fields.name);
  const id = body.id || `staffProfile-${slug}`;
  const now = new Date().toISOString();
  const saved = await adminClient.createOrReplace({
    _id: id,
    _type: "staffProfile",
    name: fields.name.trim(),
    displayName: clean(fields.displayName),
    slug: { _type: "slug", current: slug },
    primaryTitle: clean(fields.primaryTitle),
    email: clean(fields.email),
    bio: clean(fields.bio),
    clinicalFocus: lines(fields.clinicalFocus),
    education: lines(fields.education),
    credentials: lines(fields.credentials),
    imageAlt: clean(fields.imageAlt),
    status: clean(fields.status) || "published",
    seoTitle: clean(fields.seoTitle),
    seoDescription: clean(fields.seoDescription),
    updatedAt: now,
  });

  revalidatePath("/admin/staff");
  return NextResponse.json({ id: saved._id });
}

function clean(value?: string) {
  return value?.trim() || undefined;
}

function lines(value?: string) {
  return value?.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) ?? [];
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
