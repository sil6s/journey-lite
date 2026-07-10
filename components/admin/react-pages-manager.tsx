"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Plus, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { scoreSeo } from "@/lib/seo/scoring";
import type { ReactPageContentBlock, ReactPageOverride } from "@/src/lib/sanity/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { saveReactPageOverrideAction } from "@/app/admin/react-pages/actions";

const knownPages = ["/", "/about", "/about/our-team", "/about/physicians", "/about/dietitians", "/about/surgery-center", "/about/history", "/about/locations", "/medications", "/bariatric-metrics", "/contact", "/patient-stories", "/fmla-short-term-disability-paperwork", "/shop", "/shop/cart", "/blog", "/blog/legacy"];

const emptyPage: ReactPageOverride = {
  _id: "",
  title: "New React page override",
  path: "/",
  status: "active",
  robots: "index,follow",
  structuredDataType: "WebPage",
  adminWarning: "This is a React-coded page. You can edit SEO and managed content blocks here, but layout, core widgets, forms, and complex page sections still require code changes.",
  contentBlocks: [],
};

export function ReactPagesManager({ initialPages }: { initialPages: ReactPageOverride[] }) {
  const [pages, setPages] = useState(initialPages);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialPages[0]?._id ?? "new");
  const [draft, setDraft] = useState<ReactPageOverride>(initialPages[0] ?? emptyPage);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return pages.filter((page) => [page.title, page.path, page.seoTitle, page.focusKeyword].filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [pages, query]);

  const seo = scoreSeo({
    url: draft.path,
    title: draft.seoTitle,
    description: draft.seoDescription,
    h1Texts: [draft.headline || draft.title],
    h2Count: draft.contentBlocks?.filter((block) => block.heading).length ?? 0,
    firstParagraph: draft.summary || draft.contentBlocks?.[0]?.body,
    bodyText: [draft.headline, draft.summary, ...(draft.contentBlocks ?? []).flatMap((block) => [block.heading, block.body])].filter(Boolean).join(" "),
    focusKeyword: draft.focusKeyword,
    canonicalUrl: draft.canonicalUrl,
    robots: draft.robots,
    structuredData: Boolean(draft.structuredDataType),
    ogTitle: draft.ogTitle || draft.seoTitle,
    ogDescription: draft.ogDescription || draft.seoDescription,
  });

  function selectPage(page: ReactPageOverride) {
    setSelectedId(page._id);
    setDraft({ ...page, contentBlocks: page.contentBlocks ?? [] });
  }

  function save() {
    startTransition(async () => {
      try {
        await saveReactPageOverrideAction(draft._id ? draft : { ...draft, _id: undefined });
        toast.success("React page override saved");
        window.location.reload();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Save failed");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr_320px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>React pages</CardTitle>
              <CardDescription>Guided edits for pages still written in code.</CardDescription>
            </div>
            <Button size="icon" variant="outline" onClick={() => { setSelectedId("new"); setDraft(emptyPage); }}>
              <Plus />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages..." />
          </div>
          <div className="grid gap-2">
            {filtered.map((page) => (
              <button className={`rounded-lg border p-3 text-left text-sm ${selectedId === page._id ? "border-[#145c42] bg-[#f3f8f5]" : "bg-white"}`} key={page._id} onClick={() => selectPage(page)} type="button">
                <span className="block font-medium">{page.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{page.path}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit page</CardTitle>
          <CardDescription>SEO overrides apply to the public route. Managed content appears as an additional editable section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-2 font-semibold"><AlertTriangle className="size-4" /> React-coded page warning</div>
            <p className="mt-2">{draft.adminWarning || emptyPage.adminWarning}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Admin title"><Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
            <Field label="URL path">
              <Select value={draft.path} onValueChange={(path) => setDraft({ ...draft, path })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{knownPages.map((path) => <SelectItem key={path} value={path}>{path}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={draft.status ?? "active"} onValueChange={(status) => setDraft({ ...draft, status: status as ReactPageOverride["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Primary keyword"><Input value={draft.focusKeyword ?? ""} onChange={(event) => setDraft({ ...draft, focusKeyword: event.target.value })} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={`SEO title (${draft.seoTitle?.length ?? 0}/60 ideal)`}><Input value={draft.seoTitle ?? ""} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} /></Field>
            <Field label="Canonical URL"><Input value={draft.canonicalUrl ?? ""} onChange={(event) => setDraft({ ...draft, canonicalUrl: event.target.value })} /></Field>
          </div>
          <Field label={`SEO description (${draft.seoDescription?.length ?? 0}/160 ideal)`}><Textarea rows={3} value={draft.seoDescription ?? ""} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Robots">
              <Select value={draft.robots ?? "index,follow"} onValueChange={(robots) => setDraft({ ...draft, robots: robots as ReactPageOverride["robots"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="index,follow">Index, follow</SelectItem><SelectItem value="noindex,follow">Noindex, follow</SelectItem><SelectItem value="noindex,nofollow">Noindex, nofollow</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Structured data type"><Input value={draft.structuredDataType ?? "WebPage"} onChange={(event) => setDraft({ ...draft, structuredDataType: event.target.value as ReactPageOverride["structuredDataType"] })} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Open Graph title"><Input value={draft.ogTitle ?? ""} onChange={(event) => setDraft({ ...draft, ogTitle: event.target.value })} /></Field>
            <Field label="Open Graph description"><Input value={draft.ogDescription ?? ""} onChange={(event) => setDraft({ ...draft, ogDescription: event.target.value })} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Managed eyebrow"><Input value={draft.eyebrow ?? ""} onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })} /></Field>
            <Field label="Managed headline"><Input value={draft.headline ?? ""} onChange={(event) => setDraft({ ...draft, headline: event.target.value })} /></Field>
          </div>
          <Field label="Managed summary"><Textarea rows={4} value={draft.summary ?? ""} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></Field>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Content blocks</Label>
              <Button variant="outline" onClick={() => setDraft({ ...draft, contentBlocks: [...(draft.contentBlocks ?? []), { _key: crypto.randomUUID(), heading: "", body: "" }] })}><Plus /> Add block</Button>
            </div>
            {(draft.contentBlocks ?? []).map((block, index) => (
              <div className="grid gap-3 rounded-lg border p-4" key={block._key ?? index}>
                <Input placeholder="Heading" value={block.heading ?? ""} onChange={(event) => updateBlock(index, { ...block, heading: event.target.value })} />
                <Textarea rows={4} placeholder="Body" value={block.body ?? ""} onChange={(event) => updateBlock(index, { ...block, body: event.target.value })} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="outline"><Link href={draft.path || "/"} target="_blank"><ExternalLink /> Preview</Link></Button>
            <Button onClick={save} disabled={isPending}><Save /> {isPending ? "Saving..." : "Save"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>SEO score</CardTitle>
            <Badge variant={seo.score >= 75 ? "default" : "secondary"}>{seo.score}/100</Badge>
          </div>
          <CardDescription>{seo.label}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={seo.score} />
          <ScoreList title="Errors" rows={seo.errors} />
          <ScoreList title="Warnings" rows={seo.warnings} />
          <ScoreList title="Passed" rows={seo.passed.slice(0, 8)} />
        </CardContent>
      </Card>
    </div>
  );

  function updateBlock(index: number, block: ReactPageContentBlock) {
    setDraft({ ...draft, contentBlocks: (draft.contentBlocks ?? []).map((item, itemIndex) => itemIndex === index ? block : item) });
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function ScoreList({ title, rows }: { title: string; rows: { label: string; detail: string }[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="grid gap-2 text-xs text-muted-foreground">
        {rows.length ? rows.map((row) => <div className="rounded border p-2" key={row.label}><span className="font-medium text-foreground">{row.label}</span><br />{row.detail}</div>) : <p>None.</p>}
      </div>
    </div>
  );
}
