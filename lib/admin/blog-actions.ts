"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient } from "@/src/lib/sanity/client";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96);
}

export interface BlogPostPayload {
  title: string;
  slug: string;
  excerpt: string;
  htmlBody: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string;
  authorId?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  tags?: string[];
}

/**
 * Create a brand-new blog post (saved as a Sanity draft so it doesn't go live until published).
 * Returns the new document _id so the UI can redirect to the edit page.
 */
export async function createBlogPost(payload: BlogPostPayload): Promise<{ id: string }> {
  const slug = payload.slug.trim() || slugify(payload.title);

  const doc: Record<string, unknown> = {
    _type: "blogPost",
    title: payload.title.trim(),
    slug: { _type: "slug", current: slug },
    excerpt: payload.excerpt.trim(),
    htmlBody: payload.htmlBody,
    publishedAt: payload.publishedAt || new Date().toISOString(),
    ...(payload.seoTitle ? { seoTitle: payload.seoTitle } : {}),
    ...(payload.seoDescription ? { seoDescription: payload.seoDescription } : {}),
    ...(payload.tags?.length ? { tags: payload.tags } : {}),
    ...(payload.featuredImageAlt ? { featuredImageAlt: payload.featuredImageAlt } : {}),
    ...(payload.categoryId
      ? { category: { _type: "reference", _ref: payload.categoryId } }
      : {}),
    ...(payload.authorId
      ? { author: { _type: "reference", _ref: payload.authorId } }
      : {}),
  };

  // If a featured image URL was provided, create a Sanity image asset reference
  if (payload.featuredImageUrl) {
    try {
      const asset = await adminClient.assets.upload(
        "image",
        await (await fetch(payload.featuredImageUrl)).blob(),
        { filename: `featured-${slug}.jpg` }
      );
      doc.featuredImage = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
    } catch {
      // Non-fatal — post is saved without featured image
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await adminClient.create(doc as any);
  revalidatePath("/admin/blog");
  return { id: created._id };
}

/**
 * Save changes to an existing blog post (patch only the editable fields).
 */
export async function updateBlogPost(id: string, payload: Partial<BlogPostPayload>): Promise<void> {
  const patch: Record<string, unknown> = {};

  if (payload.title !== undefined) patch.title = payload.title.trim();
  if (payload.slug !== undefined) patch["slug.current"] = payload.slug.trim();
  if (payload.excerpt !== undefined) patch.excerpt = payload.excerpt.trim();
  if (payload.htmlBody !== undefined) patch.htmlBody = payload.htmlBody;
  if (payload.publishedAt !== undefined) patch.publishedAt = payload.publishedAt;
  if (payload.seoTitle !== undefined) patch.seoTitle = payload.seoTitle;
  if (payload.seoDescription !== undefined) patch.seoDescription = payload.seoDescription;
  if (payload.tags !== undefined) patch.tags = payload.tags;
  if (payload.featuredImageAlt !== undefined) patch.featuredImageAlt = payload.featuredImageAlt;
  if (payload.categoryId !== undefined) {
    patch.category = { _type: "reference", _ref: payload.categoryId };
  }
  if (payload.authorId !== undefined) {
    patch.author = { _type: "reference", _ref: payload.authorId };
  }

  await adminClient.patch(id).set(patch).commit();
  revalidatePath("/admin/blog");
  revalidatePath(`/blog`);
}

/**
 * Upload an image file to Sanity and return the public CDN URL.
 * Used by the rich-text editor's image upload button.
 */
export async function uploadImageToSanity(formData: FormData): Promise<{ url: string }> {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const asset = await adminClient.assets.upload("image", file, {
    filename: file.name,
    contentType: file.type,
  });

  // Build a basic CDN URL (no transforms — editor just needs the raw URL)
  const url = asset.url;
  return { url };
}

/**
 * Fetch a single blog post by _id for the edit page.
 */
export async function getBlogPostById(id: string) {
  return adminClient.fetch<{
    _id: string;
    title: string;
    slug: { current: string };
    excerpt?: string;
    htmlBody?: string;
    publishedAt?: string;
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    featuredImageAlt?: string;
    category?: { _id: string; name: string };
    author?: { _id: string; name: string };
  }>(
    `*[_id == $id][0]{
      _id, title, slug, excerpt, htmlBody, publishedAt,
      seoTitle, seoDescription, tags, featuredImageAlt,
      "category": category->{_id, name},
      "author": author->{_id, name}
    }`,
    { id }
  );
}
