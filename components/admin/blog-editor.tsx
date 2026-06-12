"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBlogPost, updateBlogPost, uploadImageToSanity } from "@/lib/admin/blog-actions";
import type { RichTextEditorHandle } from "@/components/admin/rich-text-editor";

const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-lg border border-[#dce4df] bg-zinc-50" style={{ minHeight: 400 }} />
    ),
  }
);

interface Category { _id: string; name: string }
interface Author { _id: string; name?: string }

interface BlogEditorProps {
  mode: "new" | "edit";
  postId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialHtmlBody?: string;
  initialPublishedAt?: string;
  initialSeoTitle?: string;
  initialSeoDescription?: string;
  initialTags?: string[];
  initialFeaturedImageAlt?: string;
  initialCategoryId?: string;
  initialAuthorId?: string;
  categories: Category[];
  authors: Author[];
}

function autoSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96);
}

export function BlogEditor({
  mode,
  postId,
  initialTitle = "",
  initialSlug = "",
  initialExcerpt = "",
  initialHtmlBody = "",
  initialPublishedAt,
  initialSeoTitle = "",
  initialSeoDescription = "",
  initialTags = [],
  initialFeaturedImageAlt = "",
  initialCategoryId = "",
  initialAuthorId = "",
  categories,
  authors,
}: BlogEditorProps) {
  const router = useRouter();
  const richEditorRef = useRef<RichTextEditorHandle>(null);

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [slugManual, setSlugManual] = useState(!!initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [htmlBody, setHtmlBody] = useState(initialHtmlBody);
  const [publishedAt, setPublishedAt] = useState(
    initialPublishedAt ? initialPublishedAt.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle);
  const [seoDescription, setSeoDescription] = useState(initialSeoDescription);
  const [tagsInput, setTagsInput] = useState(initialTags.join(", "));
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialFeaturedImageAlt);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [authorId, setAuthorId] = useState(initialAuthorId);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugManual) setSlug(autoSlug(v));
  }

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
        const { url } = await uploadImageToSanity(fd);
        richEditorRef.current?.insertImage(url, file.name.replace(/\.[^.]+$/, ""));
      } catch (err) {
        console.error("Image upload failed", err);
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  }

  function handleSave() {
    const finalHtml = richEditorRef.current?.getHTML() ?? htmlBody;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug: slug || autoSlug(title),
      excerpt,
      htmlBody: finalHtml,
      publishedAt: new Date(publishedAt).toISOString(),
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      tags,
      featuredImageAlt,
      categoryId: categoryId || undefined,
      authorId: authorId || undefined,
    };

    setSaved("saving");
    startTransition(async () => {
      try {
        if (mode === "new") {
          const { id } = await createBlogPost(payload);
          setSaved("saved");
          router.push(`/admin/blog/${id}`);
        } else if (postId) {
          await updateBlogPost(postId, payload);
          setSaved("saved");
          setTimeout(() => setSaved("idle"), 2000);
        }
      } catch (err) {
        console.error("Save failed", err);
        setSaved("error");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#1f2c25]">
              {mode === "new" ? "New Blog Post" : "Edit Blog Post"}
            </h1>
            <p className="text-sm text-[#5f6f66]">
              {mode === "new"
                ? "Write your article using the rich text editor below."
                : `Editing: ${initialTitle || "untitled post"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved === "saved" && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Saved</Badge>
          )}
          {saved === "error" && (
            <Badge className="bg-red-50 text-red-700 border-red-200">Save failed</Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={isPending || saved === "saving" || !title.trim()}
            className="bg-[#0D3D24] hover:bg-[#145c42] text-white"
          >
            {saved === "saving" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {mode === "new" ? "Create Post" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        {/* Main editor column */}
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1f2c25]">Title</Label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Article headline…"
              className="text-base font-semibold border-[#dce4df] focus-visible:ring-[#0D3D24]"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1f2c25]">
              Slug <span className="font-normal text-[#9aafa5]">(URL path)</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9aafa5] shrink-0">/blog/</span>
              <Input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="auto-generated-from-title"
                className="border-[#dce4df] focus-visible:ring-[#0D3D24] font-mono text-sm"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1f2c25]">
              Excerpt <span className="font-normal text-[#9aafa5]">(shown on blog index)</span>
            </Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary of the article…"
              rows={3}
              className="border-[#dce4df] focus-visible:ring-[#0D3D24] resize-none"
            />
            <p className="text-xs text-[#9aafa5]">{excerpt.length} / 220 chars</p>
          </div>

          {/* Rich text editor */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#1f2c25]">Article Body</Label>
            <RichTextEditor
              ref={richEditorRef}
              initialContent={htmlBody}
              onChange={setHtmlBody}
              onImageRequest={handleImageRequest}
              insertingImage={uploadingImage}
              minHeight={480}
            />
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Publish settings */}
          <Card className="border-[#dce4df]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-[#1f2c25]">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#5f6f66]">Published date</Label>
                <Input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="text-sm border-[#dce4df] focus-visible:ring-[#0D3D24]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#5f6f66]">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="text-sm border-[#dce4df]">
                    <SelectValue placeholder="Select category…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#5f6f66]">Author</Label>
                <Select value={authorId} onValueChange={setAuthorId}>
                  <SelectTrigger className="text-sm border-[#dce4df]">
                    <SelectValue placeholder="Select author…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {authors.map((a) => (
                      <SelectItem key={a._id} value={a._id}>{a.name ?? a._id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#5f6f66]">Tags <span className="text-[#9aafa5]">(comma-separated)</span></Label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="bariatric, weight loss, …"
                  className="text-sm border-[#dce4df] focus-visible:ring-[#0D3D24]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#5f6f66]">Featured image alt text</Label>
                <Input
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Describe the featured image…"
                  className="text-sm border-[#dce4df] focus-visible:ring-[#0D3D24]"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-[#dce4df]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-[#1f2c25]">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#5f6f66]">SEO title</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to article title"
                  className="text-sm border-[#dce4df] focus-visible:ring-[#0D3D24]"
                />
                <p className="text-[11px] text-[#9aafa5]">{seoTitle.length}/70</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#5f6f66]">Meta description</Label>
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to excerpt"
                  rows={3}
                  className="text-sm border-[#dce4df] focus-visible:ring-[#0D3D24] resize-none"
                />
                <p className="text-[11px] text-[#9aafa5]">{seoDescription.length}/170</p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced link */}
          <div className="rounded-lg border border-dashed border-[#dce4df] bg-zinc-50 p-3 text-center">
            <p className="text-xs text-[#5f6f66] mb-2">Need featured image, callouts, fact cards, or CTA blocks?</p>
            {postId && (
              <Button variant="outline" size="sm" asChild className="border-[#dce4df] text-[#5f6f66] hover:text-[#0D3D24]">
                <a href={`/studio/desk/blogPost;${postId}`} target="_blank" rel="noopener noreferrer">
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Open in Sanity Studio
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
