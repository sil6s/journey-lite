import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { adminClient } from "@/src/lib/sanity/client";
import { parseBlogPacket } from "@/lib/markdown/parseBlogPacket";
import { markdownToPortableText } from "@/lib/markdown/markdownToPortableText";

export async function POST(request: Request) {
  // TODO: Replace this with the production admin auth guard before exposing /admin publicly.
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Missing SANITY_API_WRITE_TOKEN or SANITY_WRITE_TOKEN." }, { status: 500 });
  }

  const body = (await request.json()) as { markdown?: string; publish?: boolean };
  const result = parseBlogPacket(body.markdown ?? "");
  if (!result.packet) {
    return NextResponse.json({ error: "Markdown packet validation failed.", details: result.errors }, { status: 400 });
  }

  const packet = result.packet;
  const documentId = body.publish ? randomUUID() : `drafts.${randomUUID()}`;
  const now = new Date().toISOString();
  const categoryRef = packet.category ? await findCategoryRef(packet.category) : undefined;
  const authorRef = packet.author ? await findAuthorRef(packet.author) : undefined;

  const created = await adminClient.create({
    _id: documentId,
    _type: "blogPost",
    title: packet.title,
    slug: { _type: "slug", current: packet.slug },
    excerpt: packet.excerpt,
    featuredImageAlt: packet.featuredImageAltText,
    tags: packet.tags,
    publishedAt: body.publish ? now : undefined,
    updatedAt: now,
    seoTitle: packet.metaTitle,
    seoDescription: packet.metaDescription,
    body: markdownToPortableText(packet.body),
    relatedServices: packet.internalLinks
      .map((link) => link.url)
      .filter((url) => url.startsWith("/services") || url === "/contact"),
    category: categoryRef,
    author: authorRef,
  });

  return NextResponse.json({
    id: created._id,
    studioUrl: `/studio/desk/blogPost;${created._id}`,
    warnings: result.warnings,
  });
}

async function findCategoryRef(category: string) {
  const id = await adminClient.fetch<string | null>(
    `*[_type == "category" && (lower(name) == lower($category) || slug.current == $slug)][0]._id`,
    { category, slug: slugify(category) },
  );
  return id ? { _type: "reference", _ref: id } : undefined;
}

async function findAuthorRef(author: string) {
  const id = await adminClient.fetch<string | null>(`*[_type == "author" && lower(name) == lower($author)][0]._id`, { author });
  return id ? { _type: "reference", _ref: id } : undefined;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
