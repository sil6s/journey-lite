"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, AlertTriangle, ArrowLeft, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight,
  Code2, Edit3, Eye, FileText, Globe, Hash, Image as ImageIcon, Info,
  Lightbulb, Loader2, MousePointerClick, Plus, Quote, Save, Search, Sparkles,
  Star, Trash2, TrendingUp, X, Zap,
} from "lucide-react";
import { marked } from "marked";
import TurndownService from "turndown";
import type { RichTextEditorHandle } from "@/components/admin/rich-text-editor";
import { scoreSeo, type SeoScoreResult } from "@/lib/seo/scoring";
import type { ContentItem, ContentDetail, FormDefinition } from "./actions";
import {
  fetchContentById,
  createBlogPostAction, updateBlogPostAction, deleteBlogPostAction,
  createPageAction, updatePageAction, deletePageAction,
  updateReactPageOverrideAction,
  uploadContentImage,
} from "./actions";

const RichTextEditor = dynamic(() => import("@/components/admin/rich-text-editor"), {
  ssr: false,
  loading: () => <div className="min-h-[400px] animate-pulse rounded-lg border border-[#dce4df] bg-zinc-50" />,
});

/* ── utils ────────────────────────────────────────────────────────────────── */
function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
}
function htmlToMd(html: string) {
  if (!html) return "";
  const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
  return td.turndown(html);
}
function mdToHtml(md: string): string {
  if (!md.trim()) return "";
  const r = marked.parse(md);
  return r instanceof Promise ? "" : r;
}
function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function flattenText(value?: string | string[]) {
  if (!value) return "";
  return Array.isArray(value) ? value.flat(3).filter(Boolean).join(" ") : value;
}
function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function contentSeoScore(item: ContentItem) {
  const url = item._type === "blogPost" ? `/blog/${item.slug}` : item._type === "reactPageOverride" ? item.path || item.slug : `/${item.slug}`;
  const bodyText = stripHtml(flattenText(item.bodyText) || item.htmlBody || "");
  return scoreSeo({
    url,
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.excerpt,
    h1Texts: [item.headline || item.title],
    h2Count: (bodyText.match(/\b[A-Z][^.!?]{8,80}\b/g) ?? []).length > 2 ? 1 : 0,
    firstParagraph: item.excerpt || item.summary || bodyText.slice(0, 260),
    bodyText,
    focusKeyword: item.focusKeyword,
    canonicalUrl: `https://journeylite.com${url?.startsWith("/") ? url : `/${url}`}`,
    robots: item._type === "reactPageOverride" ? undefined : "index,follow",
    structuredData: item._type !== "reactPageOverride",
    ogTitle: item.seoTitle || item.title,
    ogDescription: item.seoDescription || item.excerpt,
  });
}

/* ── types ────────────────────────────────────────────────────────────────── */
type Category = { _id: string; name: string };
type Author   = { _id: string; name: string };
type EditorMode = "rich" | "markdown" | "html";

/* ── root ─────────────────────────────────────────────────────────────────── */
export function ContentClient({
  initialPosts, initialPages, categories, authors, forms,
}: {
  initialPosts: ContentItem[];
  initialPages: ContentItem[];
  categories: Category[];
  authors: Author[];
  forms: FormDefinition[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"blog" | "pages">("blog");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ContentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [query, setQuery] = useState("");

  const refresh = () => router.refresh();

  const posts = initialPosts;
  const pages = initialPages;
  const list  = activeTab === "blog" ? posts : pages;
  const filtered = query.trim()
    ? list.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
    : list;

  async function select(item: ContentItem) {
    if (selectedId === item._id) return;
    setSelectedId(item._id);
    setDetail(null);
    if (item._id.startsWith("__react_page__")) {
      setDetail({ ...item, slug: item.slug || item.path || "/", adminWarning: item.adminWarning });
      return;
    }
    setDetailLoading(true);
    try {
      const d = await fetchContentById(item._id);
      setDetail(d);
    } finally {
      setDetailLoading(false);
    }
  }

  function deselect() {
    setSelectedId(null);
    setDetail(null);
  }

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden -mx-4 -mt-8 -mb-8 lg:-mx-8">
      {/* ── Left sidebar ───────────────────────────────────────────────── */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-[#dce4df] bg-zinc-50">
        {/* Header */}
        <div className="border-b border-[#dce4df] px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-bold text-[#1f2c25]">Content</h1>
            <div className="flex items-center gap-1.5">
            <NewContentMenu
              onNewBlog={() => { setActiveTab("blog"); setSelectedId("__new_blog"); setDetail({ _id: "__new_blog", _type: "blogPost", title: "", slug: "", htmlBody: "" }); }}
              onNewPage={() => { setActiveTab("pages"); setSelectedId("__new_page"); setDetail({ _id: "__new_page", _type: "sitePage", title: "", slug: "", htmlBody: "" }); }}
            />
            </div>{/* end flex gap-1.5 */}
          </div>{/* end justify-between */}
          {/* Tabs */}
          <div className="flex rounded-lg border border-[#dce4df] bg-white p-0.5 text-xs font-semibold">
            {(["blog", "pages"] as const).map((t) => (
              <button key={t} onClick={() => { setActiveTab(t); deselect(); }}
                className={`flex-1 rounded-md py-1.5 transition-colors capitalize ${activeTab === t ? "bg-[#0D3D24] text-white" : "text-[#5f6f66] hover:text-[#1f2c25]"}`}>
                {t === "blog" ? `Blog (${posts.length})` : `Pages (${pages.length})`}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#9aafa5]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…"
              className="w-full rounded-lg border border-[#dce4df] bg-white pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#145c42]" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#9aafa5]">No {activeTab === "blog" ? "posts" : "pages"} yet.</div>
          ) : filtered.map((item) => (
            <button key={item._id} onClick={() => select(item)}
              className={`w-full border-b border-[#dce4df] px-4 py-3 text-left transition-colors hover:bg-white ${selectedId === item._id ? "bg-white border-l-2 border-l-[#0D3D24]" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <span className={`truncate text-xs font-semibold ${selectedId === item._id ? "text-[#0D3D24]" : "text-[#1f2c25]"}`}>{item.title || "Untitled"}</span>
                <div className="flex shrink-0 items-center gap-1">
                  {item._type === "reactPageOverride" ? <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700">React</span> : null}
                  <SeoScoreBadge score={contentSeoScore(item).score} />
                  <StatusDot status={item.status} />
                </div>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[#9aafa5]">/{item.slug || "—"} · {fmtDate(item.updatedAt || item.publishedAt)}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Right editor pane ──────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {detailLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#9aafa5]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !detail ? (
          <EmptyState onNewBlog={() => { setActiveTab("blog"); setSelectedId("__new_blog"); setDetail({ _id: "__new_blog", _type: "blogPost", title: "", slug: "", htmlBody: "" }); }}
            onNewPage={() => { setActiveTab("pages"); setSelectedId("__new_page"); setDetail({ _id: "__new_page", _type: "sitePage", title: "", slug: "", htmlBody: "" }); }} />
        ) : (
          detail._type === "reactPageOverride" ? (
            <ReactPageOverrideEditor
              key={detail._id}
              detail={detail}
              onSaved={() => refresh()}
            />
          ) : (
            <ContentEditor
              key={detail._id}
              detail={detail}
              categories={categories}
              authors={authors}
              forms={forms}
              onSaved={(newId?: string) => { if (newId) setSelectedId(newId); refresh(); }}
              onDelete={() => { deselect(); refresh(); }}
            />
          )
        )}
      </main>
    </div>
  );
}

function SeoScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-50 text-emerald-700" : score >= 75 ? "bg-green-50 text-green-700" : score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${color}`}>{score}</span>;
}

/* ── Status dot ───────────────────────────────────────────────────────────── */
function StatusDot({ status }: { status?: string }) {
  const map: Record<string, string> = { published: "bg-emerald-400", draft: "bg-amber-400", scheduled: "bg-blue-400" };
  return <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${map[status ?? "draft"] ?? "bg-zinc-300"}`} />;
}

/* ── New content menu ────────────────────────────────────────────────────── */
function NewContentMenu({ onNewBlog, onNewPage }: { onNewBlog: () => void; onNewPage: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-lg bg-[#0D3D24] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42]">
        <Plus className="h-3.5 w-3.5" /> New
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-[#dce4df] bg-white py-1 shadow-lg">
          <button onClick={() => { onNewBlog(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1f2c25] hover:bg-zinc-50">
            <BookOpen className="h-3.5 w-3.5 text-[#145c42]" /> Blog post
          </button>
          <button onClick={() => { onNewPage(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1f2c25] hover:bg-zinc-50">
            <FileText className="h-3.5 w-3.5 text-[#5f6f66]" /> Static page
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ onNewBlog, onNewPage }: { onNewBlog: () => void; onNewPage: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <FileText className="h-12 w-12 text-[#dce4df]" />
      <div>
        <p className="font-semibold text-[#1f2c25]">Select content to edit</p>
        <p className="mt-1 text-sm text-[#9aafa5]">Or create something new</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onNewBlog} className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145c42]">
          <BookOpen className="h-4 w-4" /> New Blog Post
        </button>
        <button onClick={onNewPage} className="flex items-center gap-1.5 rounded-lg border border-[#dce4df] px-4 py-2 text-sm font-semibold text-[#1f2c25] hover:bg-zinc-50">
          <FileText className="h-4 w-4" /> New Page
        </button>
      </div>
    </div>
  );
}

/* ── Main content editor ─────────────────────────────────────────────────── */
function ContentEditor({
  detail, categories, authors, forms, onSaved, onDelete,
}: {
  detail: ContentDetail;
  categories: Category[];
  authors: Author[];
  forms: FormDefinition[];
  onSaved: (newId?: string) => void;
  onDelete: () => void;
}) {
  const richRef = useRef<RichTextEditorHandle>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  const isNew  = detail._id.startsWith("__new_");
  const isBlog = detail._type === "blogPost";

  const [title, setTitle]           = useState(detail.title || "");
  const [slug, setSlug]             = useState(detail.slug || "");
  const [slugManual, setSlugManual] = useState(!!detail.slug);
  const [htmlBody, setHtmlBody]     = useState(detail.htmlBody || "");
  const [mdDraft, setMdDraft]       = useState("");
  const [mode, setMode]             = useState<EditorMode>("rich");
  const [richKey, setRichKey]       = useState(0);

  // blog meta
  const [excerpt, setExcerpt]       = useState(detail.excerpt || "");
  const [publishedAt, setPublishedAt] = useState(
    detail.publishedAt ? detail.publishedAt.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [categoryId, setCategoryId] = useState(detail.categoryId || "");
  const [authorId, setAuthorId]     = useState(detail.authorId || "");
  const [tags, setTags]             = useState((detail.tags || []).join(", "));
  const [seoTitle, setSeoTitle]     = useState(detail.seoTitle || "");
  const [seoDesc, setSeoDesc]       = useState(detail.seoDescription || "");
  const [focusKeyword, setFocusKeyword] = useState(detail.focusKeyword || "");

  // page meta
  const [subtitle, setSubtitle]     = useState(detail.subtitle || "");
  const [pageType, setPageType]     = useState(detail.pageType || "general");
  const [metaDesc, setMetaDesc]     = useState(detail.metaDescription || "");

  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleting, setDeleting]     = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // CTA dialog
  const [ctaOpen, setCtaOpen]       = useState(false);
  const [ctaHeadline, setCtaHeadline] = useState("Ready to start your journey?");
  const [ctaSubtext, setCtaSubtext] = useState("Book a free consultation with our bariatric team.");
  const [ctaBtn1Label, setCtaBtn1Label] = useState("Book Consultation");
  const [ctaBtn1Href, setCtaBtn1Href]   = useState("/contact");
  const [ctaBtn2Label, setCtaBtn2Label] = useState("Learn More");
  const [ctaBtn2Href, setCtaBtn2Href]   = useState("/services");

  // Form embed dialog
  const [formOpen, setFormOpen]     = useState(false);
  const [pickedForm, setPickedForm] = useState<string>("");

  // Callout / emphasis block dialog
  const [calloutOpen, setCalloutOpen] = useState(false);
  const [calloutType, setCalloutType] = useState<"info"|"tip"|"warning"|"success"|"highlight"|"stat"|"quote">("tip");
  const [calloutTitle, setCalloutTitle] = useState("");
  const [calloutText, setCalloutText]   = useState("");

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);

  // AI Builder
  const [aiOpen, setAiOpen] = useState(false);

  function handleAiInsert(data: AiFillData) {
    setAiOpen(false);
    // Title/excerpt/tags: only fill if blank, never clobber existing work.
    // SEO fields: always take the AI's values — that's the whole point of asking it to generate them.
    if (!title.trim()) handleTitleChange(data.title);
    if (isBlog) {
      if (!excerpt.trim()) setExcerpt(data.excerpt);
      setSeoTitle(data.seoTitle);
      setSeoDesc(data.seoDescription);
      if (!tags.trim() && data.tags.length) setTags(data.tags.join(", "));
    } else {
      // Pages don't have seoTitle/excerpt fields — reuse the AI's SEO description
      // for the meta description, and the excerpt for the subtitle if blank.
      setMetaDesc(data.seoDescription);
      if (!subtitle.trim()) setSubtitle(data.excerpt);
    }
    // Drop the generated article into the body at the cursor (rich mode) or append.
    if (mode === "rich") {
      richRef.current?.insertRawBlock(data.htmlBody);
    } else if (mode === "markdown") {
      setMdDraft((d) => (d ? d + "\n\n" + htmlToMd(data.htmlBody) : htmlToMd(data.htmlBody)));
    } else {
      setHtmlBody((h) => (h ? h + "\n" + data.htmlBody : data.htmlBody));
    }
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  }

  function switchMode(next: EditorMode) {
    // flush current content before switching
    const current = mode === "rich" ? (richRef.current?.getHTML() ?? htmlBody)
                  : mode === "markdown" ? mdToHtml(mdDraft)
                  : htmlBody;
    setHtmlBody(current);
    if (next === "markdown") setMdDraft(htmlToMd(current));
    if (next === "rich") setRichKey((k) => k + 1);
    setMode(next);
  }

  function getFinalHtml() {
    if (mode === "rich")     return richRef.current?.getHTML() ?? htmlBody;
    if (mode === "markdown") return mdToHtml(mdDraft);
    return htmlBody;
  }

  const renderHtml = mode === "markdown" ? mdToHtml(mdDraft) : htmlBody;
  const currentBodyText = stripHtml(renderHtml);
  const seoResult = scoreSeo({
    url: `${isBlog ? "/blog/" : "/"}${slug || slugify(title)}`,
    title: seoTitle || title,
    description: isBlog ? (seoDesc || excerpt) : (seoDesc || metaDesc || subtitle),
    h1Texts: [title],
    h2Count: (renderHtml.match(/<h2\b/gi) ?? []).length,
    firstParagraph: isBlog ? excerpt : subtitle || currentBodyText.slice(0, 260),
    bodyText: currentBodyText,
    focusKeyword,
    canonicalUrl: `https://journeylite.com${isBlog ? "/blog/" : "/"}${slug || slugify(title)}`,
    robots: "index,follow",
    structuredData: isBlog,
    ogTitle: seoTitle || title,
    ogDescription: isBlog ? (seoDesc || excerpt) : (seoDesc || metaDesc || subtitle),
  });

  async function handleImageRequest() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadingImage(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const { url } = await uploadContentImage(fd);
        if (mode === "rich") richRef.current?.insertImage(url, file.name.replace(/\.[^.]+$/, ""));
        else if (mode === "markdown") setMdDraft((d) => d + `\n![](${url})\n`);
        else setHtmlBody((h) => h + `<img src="${url}" alt="" class="max-w-full rounded-lg my-4">`);
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  }

  function insertCta() {
    const html = `<div class="jl-cta-block" style="background:#edf7f2;border:1px solid #c8ddd1;border-radius:12px;padding:2rem;margin:2rem 0;text-align:center;">
  <h3 style="font-size:1.5rem;font-weight:700;color:#0D3D24;margin:0 0 0.5rem">${ctaHeadline}</h3>
  <p style="color:#5f6f66;margin:0 0 1.25rem">${ctaSubtext}</p>
  <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
    <a href="${ctaBtn1Href}" style="background:#0D3D24;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;text-decoration:none">${ctaBtn1Label}</a>
    ${ctaBtn2Label ? `<a href="${ctaBtn2Href}" style="border:1px solid #0D3D24;color:#0D3D24;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;text-decoration:none">${ctaBtn2Label}</a>` : ""}
  </div>
</div>`;
    if (mode === "rich") {
      richRef.current?.insertRawBlock(html);
    } else {
      const current = getFinalHtml();
      setHtmlBody(current + html);
      if (mode === "markdown") setMdDraft((d) => d + "\n\n<!-- CTA Block inserted — switch to HTML mode to edit -->\n");
    }
    setCtaOpen(false);
  }

  function insertFormEmbed() {
    const form = forms.find((f) => f._id === pickedForm);
    if (!form) return;
    const html = `<div class="jl-form-embed" data-form-key="${form.slug}" data-form-name="${form.name}" style="background:#f7faf8;border:1px solid #dce4df;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
  <p style="color:#5f6f66;font-size:0.875rem;font-style:italic">Form: <strong>${form.name}</strong> (renders on the live site)</p>
</div>`;
    if (mode === "rich") {
      richRef.current?.insertRawBlock(html);
    } else {
      const current = getFinalHtml();
      setHtmlBody(current + html);
    }
    setFormOpen(false);
    setPickedForm("");
  }

  function insertCallout() {
    const styles: Record<string, { bg: string; border: string; titleColor: string; textColor: string; badge: string }> = {
      tip:       { bg: "#f0fdf4", border: "#86efac", titleColor: "#166534", textColor: "#15803d", badge: "TIP" },
      info:      { bg: "#eff6ff", border: "#93c5fd", titleColor: "#1d4ed8", textColor: "#1e40af", badge: "INFO" },
      warning:   { bg: "#fffbeb", border: "#fcd34d", titleColor: "#92400e", textColor: "#b45309", badge: "NOTE" },
      success:   { bg: "#f0fdf4", border: "#4ade80", titleColor: "#14532d", textColor: "#166534", badge: "DONE" },
      highlight: { bg: "#faf5ff", border: "#c4b5fd", titleColor: "#5b21b6", textColor: "#6d28d9", badge: "KEY" },
      stat:      { bg: "#0D3D24", border: "#145c42", titleColor: "#ffffff", textColor: "#d1fae5", badge: "STAT" },
      quote:     { bg: "#f9fafb", border: "#d1d5db", titleColor: "#111827", textColor: "#374151", badge: "“" },
    };
    const s = styles[calloutType];
    const titleHtml = calloutTitle.trim()
      ? `<p style="font-weight:700;font-size:1rem;color:${s.titleColor};margin:0 0 0.35rem"><span style="font-size:0.65rem;font-weight:800;letter-spacing:0.1em;background:${s.border};color:${s.titleColor};padding:1px 6px;border-radius:4px;margin-right:8px;vertical-align:middle">${s.badge}</span>${calloutTitle}</p>`
      : "";
    const html = `<div class="jl-callout jl-callout-${calloutType}" style="background:${s.bg};border:1.5px solid ${s.border};border-radius:12px;padding:1.25rem 1.5rem;margin:1.5rem 0;">
  ${titleHtml}<p style="color:${s.textColor};margin:0;line-height:1.65">${calloutText}</p>
</div>`;
    if (mode === "rich") {
      richRef.current?.insertRawBlock(html);
    } else {
      const current = getFinalHtml();
      setHtmlBody(current + html);
    }
    setCalloutOpen(false);
    setCalloutTitle("");
    setCalloutText("");
  }

  // Fields required before content can go live. Drafts skip this check.
  function getMissingFields(): string[] {
    const bodyText = getFinalHtml().replace(/<[^>]*>/g, "").trim();
    const missing: string[] = [];
    if (!title.trim()) missing.push("Title");
    if (!(slug || slugify(title)).trim()) missing.push("Slug");
    if (!bodyText) missing.push("Content body");
    if (isBlog) {
      if (!excerpt.trim()) missing.push("Excerpt");
      if (!seoTitle.trim()) missing.push("SEO title");
      if (!seoDesc.trim()) missing.push("SEO description");
    } else {
      if (!metaDesc.trim()) missing.push("Meta description");
    }
    return missing;
  }

  async function handleSave(asDraft = false): Promise<boolean> {
    const body = getFinalHtml();
    setSaving(true);
    try {
      if (isBlog) {
        const data = {
          title, slug: slug || slugify(title),
          excerpt: excerpt || title,
          htmlBody: body,
          publishedAt: new Date(publishedAt).toISOString(),
          seoTitle: seoTitle || undefined,
          seoDescription: seoDesc || undefined,
          focusKeyword: focusKeyword || undefined,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          categoryId: categoryId || undefined,
          authorId: authorId || undefined,
          asDraft,
        };
        if (isNew) { const id = await createBlogPostAction(data); onSaved(id); }
        else { await updateBlogPostAction(detail._id, data); onSaved(); }
      } else {
        const data = {
          title, slug: slug || slugify(title),
          htmlBody: body,
          subtitle: subtitle || undefined,
          pageType,
          metaDescription: metaDesc || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDesc || metaDesc || undefined,
          focusKeyword: focusKeyword || undefined,
          status: asDraft ? "draft" : "published",
        };
        if (isNew) { const id = await createPageAction(data); onSaved(id); }
        else { await updatePageAction(detail._id, data); onSaved(); }
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      return true;
    } catch {
      setSaveStatus("error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function handleSaveDraft() {
    if (!title.trim()) {
      setValidationError("Add a title before saving — even a draft needs one.");
      return;
    }
    setValidationError(null);
    handleSave(true);
  }

  function handlePreviewAndPublish() {
    const missing = getMissingFields();
    if (missing.length > 0) {
      setValidationError(`Fill in before publishing: ${missing.join(", ")}.`);
      return;
    }
    setValidationError(null);
    setPreviewOpen(true);
  }

  async function handlePublishFromPreview() {
    const ok = await handleSave(false);
    if (ok) {
      setPreviewOpen(false);
      setLiveUrl(`${window.location.origin}${isBlog ? "/blog/" : "/"}${slug || slugify(title)}`);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      if (isBlog) await deleteBlogPostAction(detail._id);
      else await deletePageAction(detail._id);
      onDelete();
    } finally { setDeleting(false); }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-[#dce4df] bg-white px-5 py-2.5">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${isBlog ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
          {isBlog ? "Blog Post" : "Page"}
        </span>
        <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled" className="flex-1 bg-transparent text-base font-bold text-[#1f2c25] outline-none placeholder-[#9aafa5]" />
        <div className="flex items-center gap-2">
          {saveStatus === "saved" && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" />Saved</span>}
          {saveStatus === "error" && <span className="text-xs font-semibold text-red-600">Save failed</span>}
          {!isNew && (
            <button onClick={handleDelete} disabled={deleting} title="Delete"
              className="flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={handleSaveDraft} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-[#dce4df] px-3.5 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-zinc-50 disabled:opacity-50">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Save Draft
          </button>
          <button onClick={handlePreviewAndPublish} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
            Preview & Publish
          </button>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs font-semibold text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {validationError}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
          {/* Slug */}
          <div className="mb-4 flex items-center gap-2 text-xs text-[#9aafa5]">
            <Hash className="h-3.5 w-3.5" />
            <span>{isBlog ? "/blog/" : "/"}</span>
            <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              placeholder="url-slug"
              className="rounded border border-transparent bg-zinc-50 px-2 py-0.5 font-mono text-xs text-[#5f6f66] outline-none hover:border-[#dce4df] focus:border-[#145c42]" />
          </div>

          {/* Mode toggle */}
          <div className="mb-3 flex items-center gap-1">
            {(["rich", "markdown", "html"] as EditorMode[]).map((m) => (
              <ModeButton key={m} active={mode === m} onClick={() => switchMode(m)}>
                {m === "rich" ? <><Edit3 className="h-3 w-3" /> Rich</> : m === "markdown" ? <><Hash className="h-3 w-3" /> Markdown</> : <><Code2 className="h-3 w-3" /> HTML</>}
              </ModeButton>
            ))}
            {/* Block inserter */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setAiOpen(true)}
                title="Generate with AI"
                className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" /> AI
              </button>
              <div className="h-5 w-px bg-[#dce4df]" />
              <InsertButton icon={<MousePointerClick className="h-3.5 w-3.5" />} label="Insert CTA block" onClick={() => setCtaOpen(true)} />
              <InsertButton icon={<Lightbulb className="h-3.5 w-3.5" />} label="Insert callout block" onClick={() => setCalloutOpen(true)} />
              <InsertButton icon={<Zap className="h-3.5 w-3.5" />} label="Embed a form" onClick={() => setFormOpen(true)} disabled={forms.length === 0} />
              <InsertButton icon={uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />} label="Insert image" onClick={handleImageRequest} disabled={uploadingImage} />
            </div>
          </div>

          {/* Editor body */}
          {mode === "rich" && (
            <RichTextEditor key={richKey} ref={richRef} initialContent={htmlBody}
              onChange={setHtmlBody} onImageRequest={handleImageRequest}
              insertingImage={uploadingImage} minHeight={500} />
          )}
          {mode === "markdown" && (
            <textarea value={mdDraft} onChange={(e) => setMdDraft(e.target.value)}
              className="min-h-[500px] w-full resize-y rounded-lg border border-[#dce4df] bg-zinc-50 px-4 py-3 font-mono text-sm text-[#1f2c25] outline-none focus:border-[#145c42]"
              placeholder="Write in Markdown…" />
          )}
          {mode === "html" && (
            <textarea ref={htmlRef} value={htmlBody} onChange={(e) => setHtmlBody(e.target.value)}
              className="min-h-[500px] w-full resize-y rounded-lg border border-[#dce4df] bg-zinc-50 px-4 py-3 font-mono text-sm text-[#1f2c25] outline-none focus:border-[#145c42]"
              placeholder="<p>Paste or type HTML…</p>" />
          )}
        </div>

        {/* Settings sidebar */}
        <aside className="w-64 shrink-0 overflow-y-auto border-l border-[#dce4df] bg-zinc-50 px-4 py-4">
          {isBlog ? (
            <BlogSettings
              excerpt={excerpt} setExcerpt={setExcerpt}
              publishedAt={publishedAt} setPublishedAt={setPublishedAt}
              categoryId={categoryId} setCategoryId={setCategoryId}
              authorId={authorId} setAuthorId={setAuthorId}
              tags={tags} setTags={setTags}
              seoTitle={seoTitle} setSeoTitle={setSeoTitle}
              seoDesc={seoDesc} setSeoDesc={setSeoDesc}
              focusKeyword={focusKeyword} setFocusKeyword={setFocusKeyword}
              seoResult={seoResult}
              categories={categories} authors={authors}
            />
          ) : (
            <PageSettings
              subtitle={subtitle} setSubtitle={setSubtitle}
              pageType={pageType} setPageType={setPageType}
              metaDesc={metaDesc} setMetaDesc={setMetaDesc}
              seoTitle={seoTitle} setSeoTitle={setSeoTitle}
              seoDesc={seoDesc} setSeoDesc={setSeoDesc}
              focusKeyword={focusKeyword} setFocusKeyword={setFocusKeyword}
              seoResult={seoResult}
            />
          )}
        </aside>
      </div>

      {/* CTA dialog */}
      {ctaOpen && (
        <Dialog title="Insert CTA Block" onClose={() => setCtaOpen(false)}
          onConfirm={insertCta} confirmLabel="Insert CTA">
          <div className="space-y-3">
            <Field label="Headline"><input value={ctaHeadline} onChange={(e) => setCtaHeadline(e.target.value)} className={inputCls} /></Field>
            <Field label="Subtext"><input value={ctaSubtext} onChange={(e) => setCtaSubtext(e.target.value)} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Button 1 label"><input value={ctaBtn1Label} onChange={(e) => setCtaBtn1Label(e.target.value)} className={inputCls} /></Field>
              <Field label="Button 1 link"><input value={ctaBtn1Href} onChange={(e) => setCtaBtn1Href(e.target.value)} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Button 2 label (optional)"><input value={ctaBtn2Label} onChange={(e) => setCtaBtn2Label(e.target.value)} className={inputCls} /></Field>
              <Field label="Button 2 link"><input value={ctaBtn2Href} onChange={(e) => setCtaBtn2Href(e.target.value)} className={inputCls} /></Field>
            </div>
          </div>
        </Dialog>
      )}

      {/* Form embed dialog */}
      {formOpen && (
        <Dialog title="Embed a Form" onClose={() => setFormOpen(false)}
          onConfirm={insertFormEmbed} confirmLabel="Insert Form" disabled={!pickedForm}>
          <div className="space-y-3">
            <p className="text-xs text-[#5f6f66]">Pick a form to embed in this content. It will render for visitors on the live page.</p>
            <div className="grid gap-1.5">
              {forms.map((f) => (
                <label key={f._id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-colors ${pickedForm === f._id ? "border-[#0D3D24] bg-[#edf7f2]" : "border-[#dce4df] hover:bg-white"}`}>
                  <input type="radio" name="form" value={f._id} checked={pickedForm === f._id} onChange={() => setPickedForm(f._id)} className="accent-[#0D3D24]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1f2c25]">{f.name}</p>
                    <p className="text-xs text-[#9aafa5]">{f.fields.length} fields</p>
                  </div>
                </label>
              ))}
              {forms.length === 0 && <p className="text-xs text-[#9aafa5]">No forms yet. Create one in the Forms section.</p>}
            </div>
          </div>
        </Dialog>
      )}

      {/* Callout / emphasis block dialog */}
      {calloutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#dce4df] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dce4df] px-5 py-3">
              <h3 className="text-sm font-bold text-[#1f2c25]">Insert Callout Block</h3>
              <button onClick={() => setCalloutOpen(false)} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Type picker */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#5f6f66]">Block type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    { type: "tip",       label: "Tip",       bg: "bg-green-50  border-green-200  text-green-800" },
                    { type: "info",      label: "Info",      bg: "bg-blue-50   border-blue-200   text-blue-800" },
                    { type: "warning",   label: "Warning",   bg: "bg-amber-50  border-amber-200  text-amber-800" },
                    { type: "success",   label: "Success",   bg: "bg-emerald-50 border-emerald-200 text-emerald-800" },
                    { type: "highlight", label: "Highlight", bg: "bg-purple-50 border-purple-200 text-purple-800" },
                    { type: "stat",      label: "Stat",      bg: "bg-[#0D3D24] border-[#145c42]  text-white" },
                    { type: "quote",     label: "Quote",     bg: "bg-zinc-100  border-zinc-300   text-zinc-800" },
                  ] as const).map(({ type, label, bg }) => (
                    <button key={type} onClick={() => setCalloutType(type as typeof calloutType)}
                      className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all ${bg} ${calloutType === type ? "ring-2 ring-offset-1 ring-[#0D3D24]" : "opacity-70 hover:opacity-100"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5f6f66]">Title (optional)</label>
                <input value={calloutTitle} onChange={(e) => setCalloutTitle(e.target.value)}
                  placeholder="Key takeaway…"
                  className="w-full rounded-lg border border-[#dce4df] bg-white px-3 py-1.5 text-sm text-[#1f2c25] outline-none focus:border-[#145c42]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5f6f66]">Content *</label>
                <textarea value={calloutText} onChange={(e) => setCalloutText(e.target.value)} rows={3}
                  placeholder="Write your callout text here…"
                  className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-sm text-[#1f2c25] outline-none focus:border-[#145c42]" />
              </div>
              {/* Live preview */}
              {calloutText && (
                <CalloutPreview type={calloutType} title={calloutTitle} text={calloutText} />
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#dce4df] px-5 py-3">
              <button onClick={() => setCalloutOpen(false)} className="rounded-lg border border-[#dce4df] px-4 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-zinc-50">Cancel</button>
              <button onClick={insertCallout} disabled={!calloutText.trim()}
                className="rounded-lg bg-[#0D3D24] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">Insert Block</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Builder panel */}
      {aiOpen && (
        <AiGeneratePanel onClose={() => setAiOpen(false)} onInsert={handleAiInsert} />
      )}

      {/* Content preview modal */}
      {previewOpen && (
        <ContentPreviewModal
          title={title}
          excerpt={excerpt}
          publishedAt={publishedAt}
          authorName={authors.find((a) => a._id === authorId)?.name}
          categoryName={categories.find((c) => c._id === categoryId)?.name}
          isBlog={isBlog}
          html={renderHtml}
          forms={forms}
          onClose={() => setPreviewOpen(false)}
          onPublish={handlePublishFromPreview}
          isSaving={saving}
          isNew={isNew}
        />
      )}

      {/* Live confirmation popup */}
      {liveUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#dce4df] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-[#1f2c25]">Your {isBlog ? "post" : "page"} is live!</h3>
            <p className="mt-1 text-xs text-[#5f6f66]">It&apos;s published and visible to visitors now.</p>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer"
              className="mt-4 block truncate rounded-lg border border-[#dce4df] bg-zinc-50 px-3 py-2 text-xs font-medium text-[#145c42] hover:bg-zinc-100">
              {liveUrl}
            </a>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setLiveUrl(null)}
                className="flex-1 rounded-lg border border-[#dce4df] px-3 py-2 text-xs font-semibold text-[#5f6f66] hover:bg-zinc-50">
                Close
              </button>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-[#0D3D24] px-3 py-2 text-xs font-semibold text-white hover:bg-[#145c42]">
                View it live
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReactPageOverrideEditor({ detail, onSaved }: { detail: ContentDetail; onSaved: () => void }) {
  const [title, setTitle] = useState(detail.title || "");
  const [path, setPath] = useState(detail.path || detail.slug || "/");
  const [status, setStatus] = useState<"active" | "draft" | "archived">((detail.status as "active" | "draft" | "archived") || "active");
  const [warning, setWarning] = useState(detail.adminWarning || "This is a React-coded page. You can edit SEO and managed content blocks here, but layout, core widgets, forms, and complex page sections still require code changes.");
  const [headline, setHeadline] = useState(detail.headline || "");
  const [summary, setSummary] = useState(detail.summary || "");
  const [blocks, setBlocks] = useState(detail.contentBlocks || []);
  const [seoTitle, setSeoTitle] = useState(detail.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(detail.seoDescription || "");
  const [focusKeyword, setFocusKeyword] = useState(detail.focusKeyword || "");
  const [canonicalUrl, setCanonicalUrl] = useState(detail.canonicalUrl || "");
  const [robots, setRobots] = useState<"index,follow" | "noindex,follow" | "noindex,nofollow">(detail.robots || "index,follow");
  const [ogTitle, setOgTitle] = useState(detail.ogTitle || "");
  const [ogDescription, setOgDescription] = useState(detail.ogDescription || "");
  const [structuredDataType, setStructuredDataType] = useState(detail.structuredDataType || "WebPage");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const bodyText = [headline, summary, ...blocks.flatMap((block) => [block.heading, block.body])].filter(Boolean).join(" ");
  const seoResult = scoreSeo({
    url: path,
    title: seoTitle || title,
    description: seoDesc || summary,
    h1Texts: [headline || title],
    h2Count: blocks.filter((block) => block.heading).length,
    firstParagraph: summary || blocks[0]?.body,
    bodyText,
    focusKeyword,
    canonicalUrl,
    robots,
    structuredData: Boolean(structuredDataType),
    ogTitle: ogTitle || seoTitle || title,
    ogDescription: ogDescription || seoDesc || summary,
  });

  async function save() {
    setSaving(true);
    try {
      await updateReactPageOverrideAction(detail._id, {
        title,
        path,
        status,
        adminWarning: warning,
        headline,
        summary,
        contentBlocks: blocks,
        seoTitle,
        seoDescription: seoDesc,
        focusKeyword,
        canonicalUrl,
        robots,
        ogTitle,
        ogDescription,
        structuredDataType,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      onSaved();
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[#dce4df] bg-white px-5 py-2.5">
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-700">React Page</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="React page title" className="flex-1 bg-transparent text-base font-bold text-[#1f2c25] outline-none placeholder-[#9aafa5]" />
        {saveStatus === "saved" && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" />Saved</span>}
        {saveStatus === "error" && <span className="text-xs font-semibold text-red-600">Save failed</span>}
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> React-coded page warning</div>
            <textarea value={warning} onChange={(e) => setWarning(e.target.value)} rows={3}
              className="mt-3 w-full resize-none rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-xs text-amber-950 outline-none focus:border-amber-500" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="URL path">
              <input value={path} onChange={(e) => setPath(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputCls}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <Section title="Managed content">
            <Field label="Headline">
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Summary">
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4}
                className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
            </Field>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#5f6f66]">Extra content blocks</p>
                <button className="rounded-lg border border-[#dce4df] px-2 py-1 text-xs font-semibold text-[#5f6f66] hover:bg-white"
                  onClick={() => setBlocks([...blocks, { _key: crypto.randomUUID(), heading: "", body: "" }])}>
                  Add block
                </button>
              </div>
              {blocks.map((block, index) => (
                <div className="rounded-lg border border-[#dce4df] bg-white p-3" key={block._key ?? index}>
                  <input value={block.heading || ""} onChange={(e) => updateBlock(index, { ...block, heading: e.target.value })} placeholder="Heading" className={inputCls} />
                  <textarea value={block.body || ""} onChange={(e) => updateBlock(index, { ...block, body: e.target.value })} rows={4} placeholder="Body"
                    className="mt-2 w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
                </div>
              ))}
            </div>
          </Section>
        </div>

        <aside className="w-72 shrink-0 overflow-y-auto border-l border-[#dce4df] bg-zinc-50 px-4 py-4">
          <div className="space-y-5">
            <Section title="SEO">
              <SeoScorePanel result={seoResult} />
              <Field label="Primary keyword">
                <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} className={inputCls} />
              </Field>
              <Field label="SEO title">
                <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} />
                <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoTitle.length}/70</p>
              </Field>
              <Field label="SEO description">
                <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3}
                  className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
                <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoDesc.length}/170</p>
              </Field>
              <Field label="Canonical URL">
                <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Robots">
                <select value={robots} onChange={(e) => setRobots(e.target.value as typeof robots)} className={inputCls}>
                  <option value="index,follow">Index, follow</option>
                  <option value="noindex,follow">Noindex, follow</option>
                  <option value="noindex,nofollow">Noindex, nofollow</option>
                </select>
              </Field>
              <Field label="Open Graph title">
                <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Open Graph description">
                <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={3}
                  className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
              </Field>
              <Field label="Structured data type">
                <input value={structuredDataType} onChange={(e) => setStructuredDataType(e.target.value)} className={inputCls} />
              </Field>
            </Section>
          </div>
        </aside>
      </div>
    </div>
  );

  function updateBlock(index: number, block: NonNullable<ContentDetail["contentBlocks"]>[number]) {
    setBlocks(blocks.map((item, itemIndex) => itemIndex === index ? block : item));
  }
}

/* ── Settings panels ─────────────────────────────────────────────────────── */
function BlogSettings({ excerpt, setExcerpt, publishedAt, setPublishedAt, categoryId, setCategoryId, authorId, setAuthorId, tags, setTags, seoTitle, setSeoTitle, seoDesc, setSeoDesc, focusKeyword, setFocusKeyword, seoResult, categories, authors }: {
  excerpt: string; setExcerpt: (v: string) => void;
  publishedAt: string; setPublishedAt: (v: string) => void;
  categoryId: string; setCategoryId: (v: string) => void;
  authorId: string; setAuthorId: (v: string) => void;
  tags: string; setTags: (v: string) => void;
  seoTitle: string; setSeoTitle: (v: string) => void;
  seoDesc: string; setSeoDesc: (v: string) => void;
  focusKeyword: string; setFocusKeyword: (v: string) => void;
  seoResult: SeoScoreResult;
  categories: Category[]; authors: Author[];
}) {
  return (
    <div className="space-y-5">
      <Section title="Publish">
        <Field label="Published date">
          <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Author">
          <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className={inputCls}>
            <option value="">— None —</option>
            {authors.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Tags (comma-separated)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="weight loss, surgery" className={inputCls} />
        </Field>
      </Section>
      <Section title="Excerpt">
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3}
          placeholder="Short summary shown on blog index…"
          className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
        <p className="mt-0.5 text-[11px] text-[#9aafa5]">{excerpt.length}/220</p>
      </Section>
      <Section title="SEO">
        <SeoScorePanel result={seoResult} />
        <Field label="Primary keyword">
          <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="gastric sleeve cost" className={inputCls} />
        </Field>
        <Field label="SEO title">
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to post title" className={inputCls} />
          <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoTitle.length}/70</p>
        </Field>
        <Field label="Meta description">
          <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3} placeholder="Defaults to excerpt"
            className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
          <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoDesc.length}/170</p>
        </Field>
      </Section>
    </div>
  );
}

function PageSettings({ subtitle, setSubtitle, pageType, setPageType, metaDesc, setMetaDesc, seoTitle, setSeoTitle, seoDesc, setSeoDesc, focusKeyword, setFocusKeyword, seoResult }: {
  subtitle: string; setSubtitle: (v: string) => void;
  pageType: string; setPageType: (v: string) => void;
  metaDesc: string; setMetaDesc: (v: string) => void;
  seoTitle: string; setSeoTitle: (v: string) => void;
  seoDesc: string; setSeoDesc: (v: string) => void;
  focusKeyword: string; setFocusKeyword: (v: string) => void;
  seoResult: SeoScoreResult;
}) {
  const types = ["general", "service", "campaign", "education", "faq", "financing", "procedure"];
  return (
    <div className="space-y-5">
      <Section title="Page">
        <Field label="Subtitle">
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optional subtitle" className={inputCls} />
        </Field>
        <Field label="Page type">
          <select value={pageType} onChange={(e) => setPageType(e.target.value)} className={inputCls}>
            {types.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </Field>
      </Section>
      <Section title="SEO">
        <SeoScorePanel result={seoResult} />
        <Field label="Primary keyword">
          <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="weight loss consultation" className={inputCls} />
        </Field>
        <Field label="SEO title">
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to page title" className={inputCls} />
          <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoTitle.length}/70</p>
        </Field>
        <Field label="SEO description">
          <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={3} placeholder="Defaults to meta description"
            className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
          <p className="mt-0.5 text-[11px] text-[#9aafa5]">{seoDesc.length}/170</p>
        </Field>
        <Field label="Meta description">
          <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={4} placeholder="Brief description for search engines"
            className="w-full resize-none rounded-lg border border-[#dce4df] bg-white px-3 py-2 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]" />
          <p className="mt-0.5 text-[11px] text-[#9aafa5]">{metaDesc.length}/170</p>
        </Field>
      </Section>
    </div>
  );
}

function SeoScorePanel({ result }: { result: SeoScoreResult }) {
  const bar = result.score >= 90 ? "bg-emerald-500" : result.score >= 75 ? "bg-green-500" : result.score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="rounded-lg border border-[#dce4df] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-[#1f2c25]">SEO score</p>
          <p className="text-[11px] text-[#9aafa5]">{result.label}</p>
        </div>
        <SeoScoreBadge score={result.score} />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full ${bar}`} style={{ width: `${result.score}%` }} />
      </div>
      <div className="mt-3 grid gap-2 text-[11px]">
        <SeoIssueGroup label="Errors" rows={result.errors.slice(0, 3)} tone="text-red-700" />
        <SeoIssueGroup label="Warnings" rows={result.warnings.slice(0, 4)} tone="text-amber-700" />
        <SeoIssueGroup label="Passed" rows={result.passed.slice(0, 4)} tone="text-emerald-700" />
      </div>
    </div>
  );
}

function SeoIssueGroup({ label, rows, tone }: { label: string; rows: { label: string }[]; tone: string }) {
  return (
    <div>
      <p className={`font-bold ${tone}`}>{label}</p>
      {rows.length ? (
        <ul className="mt-1 space-y-1 text-[#5f6f66]">
          {rows.map((row) => <li key={row.label}>• {row.label}</li>)}
        </ul>
      ) : (
        <p className="mt-1 text-[#9aafa5]">None</p>
      )}
    </div>
  );
}

/* ── Shared primitives ───────────────────────────────────────────────────── */
const inputCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-1.5 text-xs text-[#1f2c25] outline-none focus:border-[#145c42]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aafa5]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-[#5f6f66]">{label}</label>
      {children}
    </div>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${active ? "bg-[#0D3D24] text-white" : "text-[#5f6f66] hover:bg-zinc-100 hover:text-[#1f2c25]"}`}>
      {children}
    </button>
  );
}

function InsertButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label} aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#dce4df] text-[#5f6f66] transition-colors hover:border-[#0D3D24] hover:text-[#0D3D24] disabled:opacity-40">
      {icon}
    </button>
  );
}

function Dialog({ title, children, onClose, onConfirm, confirmLabel, disabled }: {
  title: string; children: React.ReactNode;
  onClose: () => void; onConfirm: () => void; confirmLabel: string; disabled?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#dce4df] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#dce4df] px-5 py-3">
          <h3 className="text-sm font-bold text-[#1f2c25]">{title}</h3>
          <button onClick={onClose} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-[#dce4df] px-5 py-3">
          <button onClick={onClose} className="rounded-lg border border-[#dce4df] px-4 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-zinc-50">Cancel</button>
          <button onClick={onConfirm} disabled={disabled}
            className="rounded-lg bg-[#0D3D24] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ── AI Generate Panel ───────────────────────────────────────────────────── */
type AiFillData = {
  title: string; slug: string; excerpt: string; htmlBody: string;
  seoTitle: string; seoDescription: string; tags: string[]; keyword?: string;
};

function AiGeneratePanel({ onClose, onInsert }: {
  onClose: () => void;
  onInsert: (data: AiFillData) => void;
}) {
  const [topic, setTopic]         = useState("");
  const [keyword, setKeyword]     = useState("");
  const [audience, setAudience]   = useState("");
  const [length, setLength]       = useState<"short"|"medium"|"long">("medium");
  const [tone, setTone]           = useState("warm, expert, patient-focused");
  const [extra, setExtra]         = useState("");

  const [status, setStatus]       = useState<"idle"|"streaming"|"done"|"error">("idle");
  const [streamText, setStreamText] = useState("");
  const [errorMsg, setErrorMsg]   = useState("");
  const [result, setResult]       = useState<(AiFillData & { wordCount?: number; keywordDensity?: number }) | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setStatus("streaming");
    setStreamText("");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keyword, audience, length, tone, extraInstructions: extra }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            setStatus("done");
            try {
              const parsed = JSON.parse(accumulated);
              setResult({
                title: parsed.title ?? "",
                slug: parsed.slug ?? "",
                excerpt: parsed.excerpt ?? "",
                htmlBody: parsed.htmlBody ?? "",
                seoTitle: parsed.seoTitle ?? "",
                seoDescription: parsed.seoDescription ?? "",
                tags: Array.isArray(parsed.tags) ? parsed.tags : [],
                keyword: parsed.keyword ?? "",
                wordCount: parsed.wordCount,
                keywordDensity: parsed.keywordDensity,
              });
            } catch {
              setStatus("error");
              setErrorMsg("Failed to parse AI response. The API may have returned invalid JSON.");
            }
            break;
          }
          try {
            const chunk = JSON.parse(data);
            if (chunk.delta) {
              accumulated += chunk.delta;
              setStreamText(accumulated);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  function handleUse() {
    if (result) onInsert(result);
  }

  const lengthOpts: { value: "short"|"medium"|"long"; label: string; desc: string }[] = [
    { value: "short",  label: "Short",  desc: "600–800 words" },
    { value: "medium", label: "Medium", desc: "900–1200 words" },
    { value: "long",   label: "Long",   desc: "1400–1800 words" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-3xl flex-col rounded-2xl border border-[#dce4df] bg-white shadow-2xl max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#dce4df] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-[#1f2c25]">AI Blog Generator</h2>
            <p className="text-[11px] text-[#9aafa5]">Powered by Gemini · SEO-optimized for JourneyLite</p>
          </div>
          <button onClick={onClose} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: inputs */}
          <div className="w-72 shrink-0 overflow-y-auto border-r border-[#dce4df] px-5 py-5 space-y-4">
            <AiField label="Topic *" hint="What is the article about?">
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2}
                placeholder="Gastric sleeve surgery recovery timeline"
                className={aiInputCls} />
            </AiField>
            <AiField label="Primary keyword" hint="Optional — leave blank and the AI will choose the best SEO keyword for your topic">
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder="Leave blank to let AI pick one"
                className={aiInputCls} />
            </AiField>
            <AiField label="Target audience" hint="Leave blank for JourneyLite default">
              <input value={audience} onChange={(e) => setAudience(e.target.value)}
                placeholder="Adults considering weight loss surgery"
                className={aiInputCls} />
            </AiField>
            <AiField label="Article length">
              <div className="grid grid-cols-3 gap-1">
                {lengthOpts.map((o) => (
                  <button key={o.value} onClick={() => setLength(o.value)}
                    className={`rounded-lg border py-2 text-center transition-colors ${length === o.value ? "border-violet-400 bg-violet-50 text-violet-700" : "border-[#dce4df] text-[#5f6f66] hover:border-[#9aafa5]"}`}>
                    <p className="text-xs font-bold">{o.label}</p>
                    <p className="text-[10px] text-[#9aafa5]">{o.desc}</p>
                  </button>
                ))}
              </div>
            </AiField>
            <AiField label="Tone">
              <input value={tone} onChange={(e) => setTone(e.target.value)}
                placeholder="warm, expert, patient-focused"
                className={aiInputCls} />
            </AiField>
            <AiField label="Extra instructions" hint="Optional extra guidelines">
              <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={3}
                placeholder="Include stats about sleeve success rates. Mention our Cincinnati location."
                className={aiInputCls} />
            </AiField>

            <button
              onClick={generate}
              disabled={!topic.trim() || status === "streaming"}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {status === "streaming"
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                : <><Sparkles className="h-4 w-4" /> Generate Article</>}
            </button>
          </div>

          {/* Right: output */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {status === "idle" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
                <div className="rounded-full bg-violet-50 p-4">
                  <Sparkles className="h-8 w-8 text-violet-400" />
                </div>
                <p className="font-semibold text-[#1f2c25]">Ready to generate</p>
                <p className="text-sm text-[#9aafa5] max-w-xs">Fill in your topic on the left, then click Generate. The AI will pick a target keyword and write a full SEO-optimized article.</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#9aafa5] justify-center">
                  {["Keyword density 1–1.5%", "3+ H2 headings", "Internal links", "Meta description", "E-E-A-T signals"].map((t) => (
                    <span key={t} className="flex items-center gap-1 rounded-full border border-[#dce4df] px-2 py-0.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" />{t}</span>
                  ))}
                </div>
              </div>
            )}

            {(status === "streaming" || status === "done" || status === "error") && (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* SEO score bar (shown when done) */}
                {status === "done" && result && (
                  <div className="flex items-center gap-4 border-b border-[#dce4df] bg-zinc-50 px-5 py-3 flex-wrap">
                    {result.keyword && <SeoStat label="Keyword" value={result.keyword} good />}
                    <SeoStat label="Words" value={String(result.wordCount ?? "—")} good={(result.wordCount ?? 0) > 600} />
                    <SeoStat
                      label="Keyword density"
                      value={result.keywordDensity != null ? `${result.keywordDensity.toFixed(1)}%` : "—"}
                      good={(result.keywordDensity ?? 0) >= 1.0 && (result.keywordDensity ?? 0) <= 1.5}
                      warn={(result.keywordDensity ?? 0) > 1.5}
                    />
                    {result.slug && <SeoStat label="Slug" value={`/blog/${result.slug.slice(0, 28)}…`} good />}
                    <div className="ml-auto flex gap-2">
                      <button onClick={generate} className="rounded-lg border border-[#dce4df] px-3 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-white">
                        Regenerate
                      </button>
                      <button onClick={handleUse}
                        className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Insert into article
                      </button>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <p className="text-xs font-semibold text-red-700">{errorMsg || "Generation failed. Check your GEMINI_API_KEY in .env.local."}</p>
                  </div>
                )}

                {/* Stream preview */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {status === "streaming" && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-violet-600 font-semibold">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Writing article…
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[#5f6f66]">
                    {streamText || (status === "streaming" ? "▌" : "")}
                  </pre>
                </div>

                {/* Done: show preview of title + excerpt */}
                {status === "done" && result && (
                  <div className="border-t border-[#dce4df] bg-zinc-50 px-5 py-4 space-y-2 shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#9aafa5]">Preview</p>
                    <p className="font-bold text-[#0D3D24] text-sm leading-snug">{result.title}</p>
                    <p className="text-xs text-[#5f6f66]">{result.excerpt}</p>
                    {result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.tags.map((t) => (
                          <span key={t} className="rounded-full border border-[#dce4df] bg-white px-2 py-0.5 text-[10px] text-[#5f6f66]">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const aiInputCls = "w-full rounded-lg border border-[#dce4df] bg-white px-3 py-1.5 text-xs text-[#1f2c25] outline-none focus:border-violet-400 resize-none";

function AiField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#1f2c25]">{label}</label>
      {hint && <p className="mb-1 text-[10px] text-[#9aafa5]">{hint}</p>}
      {children}
    </div>
  );
}

function SeoStat({ label, value, good, warn }: { label: string; value: string; good?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {warn ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        : good ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        : <TrendingUp className="h-3.5 w-3.5 text-[#9aafa5]" />}
      <span className="text-[11px] font-semibold text-[#5f6f66]">{label}:</span>
      <span className="text-[11px] font-bold text-[#1f2c25]">{value}</span>
    </div>
  );
}

/* ── Callout live preview ─────────────────────────────────────────────────── */
const CALLOUT_STYLES: Record<string, { bg: string; border: string; titleColor: string; textColor: string; badge: string }> = {
  tip:       { bg: "#f0fdf4", border: "#86efac", titleColor: "#166534", textColor: "#15803d", badge: "TIP" },
  info:      { bg: "#eff6ff", border: "#93c5fd", titleColor: "#1d4ed8", textColor: "#1e40af", badge: "INFO" },
  warning:   { bg: "#fffbeb", border: "#fcd34d", titleColor: "#92400e", textColor: "#b45309", badge: "NOTE" },
  success:   { bg: "#f0fdf4", border: "#4ade80", titleColor: "#14532d", textColor: "#166534", badge: "DONE" },
  highlight: { bg: "#faf5ff", border: "#c4b5fd", titleColor: "#5b21b6", textColor: "#6d28d9", badge: "KEY" },
  stat:      { bg: "#0D3D24", border: "#145c42", titleColor: "#ffffff", textColor: "#d1fae5", badge: "STAT" },
  quote:     { bg: "#f9fafb", border: "#d1d5db", titleColor: "#111827", textColor: "#374151", badge: "“" },
};

function CalloutPreview({ type, title, text }: { type: string; title: string; text: string }) {
  const s = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.tip;
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9aafa5]">Preview</p>
      <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: "1.25rem 1.5rem" }}>
        {title && (
          <p style={{ fontWeight: 700, fontSize: "1rem", color: s.titleColor, margin: "0 0 0.35rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", background: s.border, color: s.titleColor, padding: "1px 6px", borderRadius: 4, marginRight: 8, verticalAlign: "middle" }}>{s.badge}</span>
            {title}
          </p>
        )}
        <p style={{ color: s.textColor, margin: 0, lineHeight: 1.65, fontSize: "0.875rem" }}>{text}</p>
      </div>
    </div>
  );
}

/* ── Content preview modal ───────────────────────────────────────────────── */
function renderFormEmbeds(html: string, forms: FormDefinition[]): string {
  return html.replace(
    /<div[^>]*class="jl-form-embed"[^>]*data-form-key="([^"]*)"[^>]*data-form-name="([^"]*)"[^>]*>[\s\S]*?<\/div>/g,
    (_, key, name) => {
      const form = forms.find((f) => f.slug === key);
      if (!form) return `<div style="background:#f7faf8;border:1px solid #dce4df;border-radius:12px;padding:1.5rem;margin:1.5rem 0;"><p style="color:#9aafa5;font-size:0.875rem;">Form: <strong>${name}</strong></p></div>`;
      const inputStyle = "display:block;width:100%;padding:0.5rem 0.75rem;border:1px solid #dce4df;border-radius:8px;font-size:0.875rem;color:#1f2c25;background:white;margin-top:4px;box-sizing:border-box;";
      const labelStyle = "display:block;font-size:0.8rem;font-weight:600;color:#5f6f66;margin-bottom:2px;";
      const fieldsHtml = form.fields.map((f) => {
        if (f.type === "textarea") return `<div style="margin-bottom:1rem;"><label style="${labelStyle}">${f.label}${f.required ? " *" : ""}</label><textarea placeholder="${f.placeholder || ""}" style="${inputStyle}height:80px;resize:none;" disabled></textarea></div>`;
        if (f.type === "checkbox" || f.type === "consent") return `<div style="margin-bottom:1rem;display:flex;align-items:flex-start;gap:0.5rem;"><input type="checkbox" disabled style="margin-top:3px;accent-color:#0D3D24;" /><label style="${labelStyle}">${f.label}${f.required ? " *" : ""}</label></div>`;
        if (f.type === "select") return `<div style="margin-bottom:1rem;"><label style="${labelStyle}">${f.label}${f.required ? " *" : ""}</label><select disabled style="${inputStyle}"><option>Select…</option></select></div>`;
        return `<div style="margin-bottom:1rem;"><label style="${labelStyle}">${f.label}${f.required ? " *" : ""}</label><input type="${f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}" placeholder="${f.placeholder || ""}" disabled style="${inputStyle}" /></div>`;
      }).join("");
      return `<div style="background:#f7faf8;border:1px solid #dce4df;border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
        <p style="font-size:0.9rem;font-weight:700;color:#1f2c25;margin:0 0 1rem;">${form.name}</p>
        ${fieldsHtml}
        <button disabled style="background:#0D3D24;color:white;border:none;padding:0.6rem 1.5rem;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:not-allowed;opacity:0.8;">Submit</button>
      </div>`;
    }
  );
}

function extractPreviewToc(html: string): Array<{ id: string; text: string }> {
  const matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  return matches.map((m) => {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return { id, text };
  }).filter((t) => t.text);
}

function injectHeadingIds(html: string): string {
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `<h2${attrs} id="${id}">${content}</h2>`;
  });
}

function formatPreviewDate(iso?: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); } catch { return ""; }
}

function ContentPreviewModal({
  title, excerpt, publishedAt, authorName, categoryName, isBlog,
  html, forms, onClose, onPublish, isSaving, isNew,
}: {
  title: string;
  excerpt?: string;
  publishedAt?: string;
  authorName?: string;
  categoryName?: string;
  isBlog: boolean;
  html: string;
  forms: FormDefinition[];
  onClose: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isNew: boolean;
}) {
  const renderedHtml = injectHeadingIds(renderFormEmbeds(html, forms));
  const toc = extractPreviewToc(renderedHtml);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Preview top bar — mimics the real site's admin bar feel */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#dce4df] bg-white px-6 py-3 shadow-sm">
        <button onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-[#dce4df] px-3 py-1.5 text-xs font-semibold text-[#5f6f66] hover:bg-zinc-50">
          <X className="h-3.5 w-3.5" /> Close Preview
        </button>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">PREVIEW</span>
        <span className="text-xs text-[#9aafa5]">Matches live site layout exactly</span>
        <div className="flex-1" />
        <button onClick={onPublish} disabled={isSaving}
          className="flex items-center gap-1.5 rounded-lg bg-[#0D3D24] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#145c42] disabled:opacity-50">
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isNew ? "Create & Publish" : "Save Changes"}
        </button>
      </div>

      {/* Scrollable content — replicates blog/[slug]/page.tsx layout */}
      <div className="flex-1 overflow-y-auto bg-white">

        {/* ── Hero header (matches <header className="bg-[#f7f8f6] py-16 lg:py-20">) */}
        <div style={{ background: "#f7f8f6", paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 2rem" }}>
            <div style={{ maxWidth: "56rem" }}>
              {/* Category eyebrow */}
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#145c42", marginBottom: "1rem" }}>
                {categoryName || (isBlog ? "JourneyLite Blog" : "Page")}
              </p>
              {/* Title in serif (matches font-serif text-5xl) */}
              <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.05, color: "#1e2b24", margin: "0 0 1.5rem", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {title || "Untitled"}
              </h1>
              {excerpt && (
                <p style={{ fontSize: "1.125rem", lineHeight: 2, color: "#53635b", marginBottom: "1.25rem" }}>{excerpt}</p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 600, color: "#64736b" }}>
                {publishedAt && <span>{formatPreviewDate(publishedAt)}</span>}
                {authorName && <span>By {authorName}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Article body with sidebar (matches section > grid > [aside + div]) */}
        <div style={{ background: "white", padding: "3rem 0" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: toc.length ? "260px 1fr" : "1fr", gap: "2.5rem" }}>

            {/* TOC sidebar */}
            {toc.length > 0 && (
              <aside style={{ alignSelf: "start", position: "sticky", top: "2rem" }}>
                <nav style={{ background: "#f8fbf9", border: "1px solid #dce4df", borderRadius: "12px", padding: "1.25rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#355346", marginBottom: "1rem" }}>In this article</p>
                  <ol style={{ margin: 0, padding: "0 0 0 1rem", lineHeight: 1.6 }}>
                    {toc.map((item) => (
                      <li key={item.id} style={{ marginBottom: "0.5rem" }}>
                        <a href={`#${item.id}`} style={{ color: "#53635b", fontSize: "0.875rem", textDecoration: "none" }}>{item.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            )}

            {/* Article body */}
            <div style={{ minWidth: 0, maxWidth: "48rem" }}>
              {/* Body prose */}
              <div className="prose prose-green max-w-none" dangerouslySetInnerHTML={{ __html: renderedHtml }} />

              {/* Medical disclaimer (matches the aside in the real page) */}
              <div style={{ marginTop: "3rem", background: "#fffdf4", border: "1px solid #d8c88b", borderRadius: "12px", padding: "1.25rem", fontSize: "0.875rem", lineHeight: 1.6, color: "#5e5235" }}>
                <p style={{ fontWeight: 700, color: "#1f2c25", margin: "0 0 0.5rem" }}>Medical disclaimer</p>
                <p style={{ margin: 0 }}>This article is for educational purposes only and does not replace medical advice. Treatment recommendations depend on your health history, BMI, goals, and provider evaluation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom CTA (matches the dark green section at the end of the real page) */}
        <div style={{ background: "#0f3e2e", padding: "4rem 0", color: "white" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 2rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#b9d2c5", marginBottom: "0.75rem" }}>Personalized next step</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, color: "white", margin: "0 0 1rem", fontFamily: "Georgia, 'Times New Roman', serif", maxWidth: "40rem", lineHeight: 1.25 }}>
              Ready to talk with JourneyLite?
            </h2>
            <p style={{ color: "#d8e6de", maxWidth: "36rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Schedule a consultation to compare surgical, non-surgical, and medication-supported options with a care team that can review your goals and health history.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <a href="/contact" style={{ background: "white", color: "#0f3e2e", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", display: "inline-block" }}>Book Consultation</a>
              <a href="/services/compare-weight-loss-options" style={{ border: "1px solid rgba(255,255,255,0.4)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", display: "inline-block" }}>Compare Options</a>
            </div>
          </div>
        </div>

      </div>

      {/* Prose + callout styles */}
      <style>{`
        .prose h2 { font-size: 1.5rem; font-weight: 700; color: #1f2c25; margin-top: 2.5rem; margin-bottom: 0.75rem; }
        .prose h3 { font-size: 1.2rem; font-weight: 700; color: #1f2c25; margin-top: 1.75rem; margin-bottom: 0.5rem; }
        .prose p { color: #374151; line-height: 1.75; margin-bottom: 1rem; }
        .prose ul, .prose ol { color: #374151; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose li { margin-bottom: 0.35rem; line-height: 1.7; }
        .prose a { color: #145c42; text-decoration: underline; }
        .prose blockquote { border-left: 4px solid #dce4df; padding-left: 1rem; color: #5f6f66; font-style: italic; margin: 1.5rem 0; }
        .prose strong { color: #1f2c25; font-weight: 700; }
        .prose img { border-radius: 12px; max-width: 100%; margin: 1.5rem 0; }
        .prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
        .prose th { background: #f7faf8; font-weight: 700; color: #1f2c25; padding: 0.6rem 1rem; border: 1px solid #dce4df; text-align: left; }
        .prose td { padding: 0.6rem 1rem; border: 1px solid #dce4df; color: #374151; }
        .jl-callout { margin: 1.5rem 0; }
        .jl-cta-block a { display: inline-block; }
      `}</style>
    </div>
  );
}
