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

const staticReactPages = [
  { title: "Home", path: "/" },
  { title: "About", path: "/about" },
  { title: "Our Team", path: "/about/our-team" },
  { title: "Physicians", path: "/about/physicians" },
  { title: "Dietitians", path: "/about/dietitians" },
  { title: "Surgery Center", path: "/about/surgery-center" },
  { title: "History", path: "/about/history" },
  { title: "Locations", path: "/about/locations" },
  { title: "Medications", path: "/medications" },
  { title: "Bariatric Metrics", path: "/bariatric-metrics" },
  { title: "Contact", path: "/contact" },
  { title: "Patient Stories", path: "/patient-stories" },
  { title: "FMLA Paperwork", path: "/fmla-short-term-disability-paperwork" },
  { title: "Shop", path: "/shop" },
  { title: "Cart", path: "/shop/cart" },
  { title: "Blog Index", path: "/blog" },
  { title: "Legacy Blog Index", path: "/blog/legacy" },
];

/* ─── Blog posts ─────────────────────────────────────────────────────────── */

export async function fetchAllContent() {
  const [posts, pages, reactPages] = await Promise.all([
    client.fetch<ContentItem[]>(
      `*[_type == "blogPost"] | order(coalesce(updatedAt, publishedAt) desc) {
        _id, _type, title, "slug": slug.current,
        publishedAt, updatedAt, htmlBody, excerpt, seoTitle, seoDescription, focusKeyword,
        "bodyText": coalesce(htmlBody, pt::text(body)),
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
        htmlBody, status, pageType, seoTitle, seoDescription, focusKeyword,
        "bodyText": coalesce(htmlBody, pt::text(sections)),
        "updatedAt": _updatedAt
      }`,
      {},
      { next: { revalidate: 30 } }
    ),
    client.fetch<ContentItem[]>(
      `*[_type == "reactPageOverride"] | order(path asc) {
        _id, _type, title,
        "slug": path,
        path,
        status,
        adminWarning,
        seoTitle,
        seoDescription,
        focusKeyword,
        headline,
        summary,
        "bodyText": [headline, summary, contentBlocks[].heading, contentBlocks[].body],
        "updatedAt": _updatedAt
      }`,
      {},
      { next: { revalidate: 30 } }
    ),
  ]);
  const existingReactPaths = new Set((reactPages ?? []).map((page) => page.path));
  const virtualReactPages: ContentItem[] = staticReactPages
    .filter((page) => !existingReactPaths.has(page.path))
    .map((page) => ({
      _id: `__react_page__${page.path}`,
      _type: "reactPageOverride",
      title: page.title,
      slug: page.path,
      path: page.path,
      status: "not configured",
      adminWarning: "This is a React-coded page. You can edit SEO and managed content blocks here, but layout, core widgets, forms, and complex page sections still require code changes.",
    }));
  return { posts: posts ?? [], pages: [...(pages ?? []), ...(reactPages ?? []), ...virtualReactPages] };
}

export type ContentItem = {
  _id: string;
  _type: "blogPost" | "sitePage" | "reactPageOverride";
  title: string;
  slug: string;
  path?: string;
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  htmlBody?: string;
  bodyText?: string | string[];
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  adminWarning?: string;
  headline?: string;
  summary?: string;
  category?: { name: string };
  pageType?: string;
};

export type ContentDetail = ContentItem & {
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  tags?: string[];
  featuredImageAlt?: string;
  categoryId?: string;
  authorId?: string;
  // page-specific
  subtitle?: string;
  metaDescription?: string;
  path?: string;
  adminWarning?: string;
  headline?: string;
  summary?: string;
  contentBlocks?: { _key?: string; heading?: string; body?: string; link?: { label?: string; href?: string } }[];
  canonicalUrl?: string;
  robots?: "index,follow" | "noindex,follow" | "noindex,nofollow";
  ogTitle?: string;
  ogDescription?: string;
  structuredDataType?: string;
};

export async function fetchContentById(id: string): Promise<ContentDetail | null> {
  const doc = await adminClient.fetch<ContentDetail & { body?: unknown[] } | null>(
    `*[_id == $id][0]{
      _id, _type, title, "slug": slug.current, htmlBody, body,
      publishedAt, updatedAt,
      excerpt, seoTitle, seoDescription, focusKeyword, tags, featuredImageAlt,
      "categoryId": category._ref,
      "authorId": author._ref,
      subtitle, metaDescription, status, pageType,
      path, adminWarning, headline, summary, contentBlocks, canonicalUrl, robots, ogTitle, ogDescription, structuredDataType,
      "status": select(
        _type == "blogPost" && _id in path("drafts.**") => "draft",
        _type == "blogPost" && !defined(publishedAt) => "draft",
        _type == "blogPost" && publishedAt > now() => "scheduled",
        _type == "blogPost" => "published",
        defined(status) => status,
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
  focusKeyword?: string; tags?: string[]; categoryId?: string; authorId?: string; asDraft?: boolean;
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
    ...(data.focusKeyword ? { focusKeyword: data.focusKeyword } : {}),
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
  focusKeyword: string; tags: string[]; categoryId: string; authorId: string; asDraft: boolean;
}>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.slug !== undefined) patch["slug.current"] = data.slug;
  if (data.excerpt !== undefined) patch.excerpt = data.excerpt;
  if (data.htmlBody !== undefined) patch.htmlBody = data.htmlBody;
  if (data.seoTitle !== undefined) patch.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) patch.seoDescription = data.seoDescription;
  if (data.focusKeyword !== undefined) patch.focusKeyword = data.focusKeyword;
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
  subtitle?: string; pageType?: string; metaDescription?: string; seoTitle?: string; seoDescription?: string; focusKeyword?: string; status?: string;
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
    ...(data.seoTitle ? { seoTitle: data.seoTitle } : {}),
    ...(data.seoDescription ? { seoDescription: data.seoDescription } : {}),
    ...(data.focusKeyword ? { focusKeyword: data.focusKeyword } : {}),
  };
  const created = await adminClient.create(doc);
  revalidateAll();
  return created._id;
}

export async function updatePageAction(id: string, data: Partial<{
  title: string; slug: string; htmlBody: string;
  subtitle: string; pageType: string; metaDescription: string; seoTitle: string; seoDescription: string; focusKeyword: string; status: string;
}>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.slug !== undefined) patch["slug.current"] = data.slug;
  if (data.htmlBody !== undefined) patch.htmlBody = data.htmlBody;
  if (data.subtitle !== undefined) patch.subtitle = data.subtitle;
  if (data.pageType !== undefined) patch.pageType = data.pageType;
  if (data.metaDescription !== undefined) patch.metaDescription = data.metaDescription;
  if (data.seoTitle !== undefined) patch.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) patch.seoDescription = data.seoDescription;
  if (data.focusKeyword !== undefined) patch.focusKeyword = data.focusKeyword;
  if (data.status !== undefined) patch.status = data.status;
  await adminClient.patch(id).set(patch).commit();
  revalidateAll();
}

export async function updateReactPageOverrideAction(id: string, data: Partial<{
  title: string;
  path: string;
  status: "active" | "draft" | "archived";
  adminWarning: string;
  headline: string;
  summary: string;
  contentBlocks: { _key?: string; heading?: string; body?: string; link?: { label?: string; href?: string } }[];
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  robots: "index,follow" | "noindex,follow" | "noindex,nofollow";
  ogTitle: string;
  ogDescription: string;
  structuredDataType: string;
}>): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.path !== undefined) patch.path = normalizePath(data.path);
  if (data.status !== undefined) patch.status = data.status;
  if (data.adminWarning !== undefined) patch.adminWarning = data.adminWarning;
  if (data.headline !== undefined) patch.headline = data.headline;
  if (data.summary !== undefined) patch.summary = data.summary;
  if (data.contentBlocks !== undefined) patch.contentBlocks = data.contentBlocks;
  if (data.seoTitle !== undefined) patch.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) patch.seoDescription = data.seoDescription;
  if (data.focusKeyword !== undefined) patch.focusKeyword = data.focusKeyword;
  if (data.canonicalUrl !== undefined) patch.canonicalUrl = data.canonicalUrl;
  if (data.robots !== undefined) patch.robots = data.robots;
  if (data.ogTitle !== undefined) patch.ogTitle = data.ogTitle;
  if (data.ogDescription !== undefined) patch.ogDescription = data.ogDescription;
  if (data.structuredDataType !== undefined) patch.structuredDataType = data.structuredDataType;
  if (id.startsWith("__react_page__")) {
    await adminClient.create({ _type: "reactPageOverride", ...patch, path: normalizePath(data.path || id.replace("__react_page__", "")) });
  } else {
    await adminClient.patch(id).set(patch).commit();
  }
  revalidatePath(data.path || "/");
  revalidatePath("/admin/content");
}

function normalizePath(path: string) {
  const trimmed = path.trim() || "/";
  if (trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
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
  type: "text" | "email" | "phone" | "textarea" | "number" | "date" | "select" | "radio" | "checkboxGroup" | "checkbox" | "file" | "hidden" | "consent";
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: { label?: string; value?: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  acceptedFileTypes?: string[];
  maxFileSizeMb?: number;
  defaultValue?: string;
  width?: "full" | "half";
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
      fields[]{
        _key,
        label,
        "key": key.current,
        type,
        placeholder,
        helpText,
        required,
        options,
        validation,
        acceptedFileTypes,
        maxFileSizeMb,
        defaultValue,
        width
      }
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
      helpText: f.helpText || "",
      required: f.required ?? false,
      options: normalizeFieldOptions(f.options),
      validation: f.validation ?? {},
      acceptedFileTypes: f.acceptedFileTypes ?? undefined,
      maxFileSizeMb: f.maxFileSizeMb ?? undefined,
      defaultValue: f.defaultValue || "",
      width: f.width || "full",
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
      helpText: f.helpText || "",
      required: f.required ?? false,
      options: normalizeFieldOptions(f.options),
      validation: f.validation ?? {},
      acceptedFileTypes: f.acceptedFileTypes ?? undefined,
      maxFileSizeMb: f.maxFileSizeMb ?? undefined,
      defaultValue: f.defaultValue || "",
      width: f.width || "full",
    })),
  }).commit();
  revalidatePath("/admin/forms");
}

export async function deleteFormAction(id: string): Promise<void> {
  await adminClient.delete(id);
  revalidatePath("/admin/forms");
}

function normalizeFieldOptions(options?: FormField["options"]) {
  return (options ?? [])
    .filter((option) => option.label || option.value)
    .map((option, index) => ({
      _key: `option_${index}_${slugify(option.value || option.label || "option")}`,
      label: option.label || option.value || "",
      value: option.value || option.label || "",
    }));
}
