"use server";

import { revalidatePath } from "next/cache";
import { adminClient } from "@/src/lib/sanity/client";
import { client } from "@/src/lib/sanity/client";
import { toHTML } from "@portabletext/to-html";

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 96);
}

function revalidateAll() {
  revalidatePath("/admin/content");
  revalidatePath("/blog");
  revalidatePath("/");
}

/* ─── Blog posts ─────────────────────────────────────────────────────────── */

export async function fetchAllContent() {
  const [posts, pages] = await Promise.all([
    client.fetch<ContentItem[]>(
      `*[_type == "blogPost"] | order(coalesce(updatedAt, publishedAt) desc) {
        _id, _type, title, "slug": slug.current,
        publishedAt, updatedAt, htmlBody,
        "status": select(
          _id in path("drafts.**") => "draft",
          !defined(publishedAt) => "draft",
          publishedAt > now() => "scheduled",
          "published"
        ),
        "category": category->{name}
      }`,
      {},
      { next: { revalidate: 30 } }
    ),
    client.fetch<ContentItem[]>(
      `*[_type == "sitePage"] | order(_updatedAt desc) {
        _id, _type, title, "slug": slug.current,
        htmlBody, status, pageType,
        "updatedAt": _updatedAt
      }`,
      {},
      { next: { revalidate: 30 } }
    ),
  ]);
  return { posts: posts ?? [], pages: pages ?? [] };
}

export type ContentItem = {
  _id: string;
  _type: "blogPost" | "sitePage";
  title: string;
  slug: string;
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  htmlBody?: string;
  category?: { name: string };
  pageType?: string;
};

export type ContentDetail = ContentItem & {
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  featuredImageAlt?: string;
  categoryId?: string;
  authorId?: string;
  // page-specific
  subtitle?: string;
  metaDescription?: string;
};

export async function fetchContentById(id: string): Promise<ContentDetail | null> {
  const doc = await adminClient.fetch<ContentDetail & { body?: unknown[] } | null>(
    `*[_id == $id][0]{
      _id, _type, title, "slug": slug.current, htmlBody, body,
      publishedAt, updatedAt,
      excerpt, seoTitle, seoDescription, tags, featuredImageAlt,
      "categoryId": category._ref,
      "authorId": author._ref,
      subtitle, metaDescription, status, pageType,
      "status": select(
        _id in path("drafts.**") => "draft",
        !defined(publishedAt) => "draft",
        publishedAt > now() => "scheduled",
        "published"
      )
    }`,
    { id }
  );
  if (!doc) return null;
  // If saved via old Portable Text editor and no htmlBody, convert body → HTML
  if (!doc.htmlBody && doc.body && Array.isArray(doc.body) && doc.body.length > 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc.htmlBody = toHTML(doc.body as any[]);
    } catch { /* leave empty */ }
  }
  const { body: _body, ...rest } = doc;
  void _body;
  return rest;
}

export async function createBlogPostAction(data: {
  title: string; slug: string; excerpt: string; htmlBody: string;
  publishedAt: string; seoTitle?: string; seoDescription?: string;
  tags?: string[]; categoryId?: string; authorId?: string; asDraft?: boolean;
}): Promise<string> {
  const slug = data.slug || slugify(data.title);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = {
    _type: "blogPost",
    title: data.title,
    slug: { _type: "slug", current: slug },
    excerpt: data.excerpt || data.title,
    htmlBody: data.htmlBody,
    // Omitting publishedAt keeps the post in "draft" status (see fetchAllContent's select()).
    ...(data.asDraft ? {} : { publishedAt: data.publishedAt || new Date().toISOString() }),
    ...(data.seoTitle ? { seoTitle: data.seoTitle } : {}),
    ...(data.seoDescription ? { seoDescription: data.seoDescription } : {}),
    ...(data.tags?.length ? { tags: data.tags } : {}),
    ...(data.categoryId ? { category: { _type: "reference", _ref: data.categoryId } } : {}),
    ...(data.authorId ? { author: { _type: "reference", _ref: data.authorId } } : {}),
  };
  const created = await adminClient.create(doc);
  revalidateAll();
  return created._id;
}

export async function updateBlogPostAction(id: string, data: Partial<{
  title: string; slug: string; excerpt: string; htmlBody: string;
  publishedAt: string; seoTitle: string; seoDescription: string;
  tags: string[]; categoryId: string; authorId: string; asDraft: boolean;
}>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.slug !== undefined) patch["slug.current"] = data.slug;
  if (data.excerpt !== undefined) patch.excerpt = data.excerpt;
  if (data.htmlBody !== undefined) patch.htmlBody = data.htmlBody;
  if (data.seoTitle !== undefined) patch.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) patch.seoDescription = data.seoDescription;
  if (data.tags !== undefined) patch.tags = data.tags;
  if (data.categoryId !== undefined) patch.category = { _type: "reference", _ref: data.categoryId };
  if (data.authorId !== undefined) patch.author = { _type: "reference", _ref: data.authorId };
  let p = adminClient.patch(id).set(patch);
  // Draft = no publishedAt. Unset it explicitly so the post reverts to draft status.
  if (data.asDraft) p = p.unset(["publishedAt"]);
  else if (data.publishedAt !== undefined) p = p.set({ publishedAt: data.publishedAt });
  await p.commit();
  revalidateAll();
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  await adminClient.delete(id);
  revalidateAll();
}

/* ─── Site pages ─────────────────────────────────────────────────────────── */

export async function createPageAction(data: {
  title: string; slug: string; htmlBody: string;
  subtitle?: string; pageType?: string; metaDescription?: string; status?: string;
}): Promise<string> {
  const slug = data.slug || slugify(data.title);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = {
    _type: "sitePage",
    title: data.title,
    slug: { _type: "slug", current: slug },
    htmlBody: data.htmlBody,
    status: data.status || "draft",
    ...(data.subtitle ? { subtitle: data.subtitle } : {}),
    ...(data.pageType ? { pageType: data.pageType } : { pageType: "general" }),
    ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
  };
  const created = await adminClient.create(doc);
  revalidateAll();
  return created._id;
}

export async function updatePageAction(id: string, data: Partial<{
  title: string; slug: string; htmlBody: string;
  subtitle: string; pageType: string; metaDescription: string; status: string;
}>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.slug !== undefined) patch["slug.current"] = data.slug;
  if (data.htmlBody !== undefined) patch.htmlBody = data.htmlBody;
  if (data.subtitle !== undefined) patch.subtitle = data.subtitle;
  if (data.pageType !== undefined) patch.pageType = data.pageType;
  if (data.metaDescription !== undefined) patch.metaDescription = data.metaDescription;
  if (data.status !== undefined) patch.status = data.status;
  await adminClient.patch(id).set(patch).commit();
  revalidateAll();
}

export async function deletePageAction(id: string): Promise<void> {
  await adminClient.delete(id);
  revalidateAll();
}

/* ─── Image upload ───────────────────────────────────────────────────────── */

export async function uploadContentImage(formData: FormData): Promise<{ url: string }> {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");
  const asset = await adminClient.assets.upload("image", file, {
    filename: file.name,
    contentType: file.type,
  });
  return { url: asset.url };
}

/* ─── Forms (Sanity formDefinition) ─────────────────────────────────────── */

export type FormField = {
  _key: string;
  label: string;
  key: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "consent";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type FormDefinition = {
  _id: string;
  name: string;
  key: string;
  slug?: string;
  status?: "active" | "inactive" | "archived";
  title?: string;
  introText?: string;
  submitEmailTo?: string;
  notificationEmails?: string[];
  successMessage?: string;
  errorMessage?: string;
  submitButtonLabel?: string;
  redirectUrl?: string;
  brevoListId?: number;
  fields: FormField[];
};

export async function fetchFormDefinitions(): Promise<FormDefinition[]> {
  return client.fetch<FormDefinition[]>(
    `*[_type == "formDefinition"] | order(name asc) {
      _id,
      name,
      "key": coalesce(key.current, slug.current),
      "slug": slug.current,
      status,
      title,
      introText,
      submitEmailTo,
      notificationEmails,
      successMessage,
      errorMessage,
      submitButtonLabel,
      redirectUrl,
      brevoListId,
      fields[]{ _key, label, "key": key.current, type, placeholder, required, options }
    }`,
    {},
    { next: { revalidate: 30 } }
  );
}

export async function createFormAction(data: {
  name: string;
  status: "active" | "inactive" | "archived";
  title: string;
  introText: string;
  notificationEmails: string[];
  successMessage: string;
  errorMessage: string;
  submitButtonLabel: string;
  redirectUrl: string;
  brevoListId: string;
  fields: FormField[];
}): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = {
    _type: "formDefinition",
    name: data.name,
    key: { _type: "slug", current: slugify(data.name) },
    status: data.status,
    title: data.title,
    introText: data.introText,
    notificationEmails: data.notificationEmails,
    successMessage: data.successMessage,
    errorMessage: data.errorMessage,
    submitButtonLabel: data.submitButtonLabel,
    redirectUrl: data.redirectUrl || undefined,
    brevoListId: data.brevoListId ? Number(data.brevoListId) : undefined,
    fields: data.fields.map((f) => ({
      _type: "formField",
      _key: f._key,
      label: f.label,
      key: { _type: "slug", current: f.key || slugify(f.label) },
      type: f.type,
      placeholder: f.placeholder || "",
      required: f.required ?? false,
    })),
  };
  const created = await adminClient.create(doc);
  revalidatePath("/admin/forms");
  return created._id;
}

export async function updateFormAction(id: string, data: {
  name: string;
  status: "active" | "inactive" | "archived";
  title: string;
  introText: string;
  notificationEmails: string[];
  successMessage: string;
  errorMessage: string;
  submitButtonLabel: string;
  redirectUrl: string;
  brevoListId: string;
  fields: FormField[];
}): Promise<void> {
  await adminClient.patch(id).set({
    name: data.name,
    status: data.status,
    title: data.title,
    introText: data.introText,
    notificationEmails: data.notificationEmails,
    successMessage: data.successMessage,
    errorMessage: data.errorMessage,
    submitButtonLabel: data.submitButtonLabel,
    redirectUrl: data.redirectUrl || undefined,
    brevoListId: data.brevoListId ? Number(data.brevoListId) : undefined,
    fields: data.fields.map((f) => ({
      _type: "formField",
      _key: f._key,
      label: f.label,
      key: { _type: "slug", current: f.key || slugify(f.label) },
      type: f.type,
      placeholder: f.placeholder || "",
      required: f.required ?? false,
    })),
  }).commit();
  revalidatePath("/admin/forms");
}

export async function deleteFormAction(id: string): Promise<void> {
  await adminClient.delete(id);
  revalidatePath("/admin/forms");
}
