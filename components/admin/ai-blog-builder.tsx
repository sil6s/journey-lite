"use client";

import { useMemo, useState } from "react";
import { Clipboard, Download, FileUp, Loader2, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { parseBlogPacket } from "@/lib/markdown/parseBlogPacket";

type BuilderState = {
  topic: string;
  mustHave: string;
  audience: string;
  category: string;
  author: string;
  reviewer: string;
  internalLinks: string;
  sources: string;
};

const initialState: BuilderState = {
  topic: "",
  mustHave: "",
  audience: "Adults comparing surgical and non-surgical weight loss options in Ohio, Kentucky, and Indiana.",
  category: "Education",
  author: "JourneyLite Physicians",
  reviewer: "",
  internalLinks: "/contact\n/services/compare-weight-loss-options\n/services/gastric-sleeve\n/medications\n/#locations",
  sources: "",
};

export function AiBlogBuilder() {
  const [state, setState] = useState(initialState);
  const [markdown, setMarkdown] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const prompt = useMemo(() => buildPrompt(state), [state]);
  const parsed = useMemo(() => parseBlogPacket(markdown), [markdown]);

  function update(key: keyof BuilderState, value: string) {
    setState((current) => ({ ...current, [key]: value }));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    toast.success("AI prompt copied.");
  }

  function downloadPrompt() {
    downloadText("journeylite-ai-blog-prompt.txt", prompt);
  }

  async function importMarkdown(publish: boolean) {
    if (!parsed.packet) {
      toast.error("Fix validation errors before importing.");
      return;
    }
    setIsImporting(true);
    try {
      const response = await fetch("/api/admin/blog/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, publish }),
      });
      const payload = (await response.json()) as { id?: string; studioUrl?: string; error?: string; details?: string[] };
      if (!response.ok) throw new Error(payload.details?.join(" ") || payload.error || "Import failed.");
      toast.success(publish ? "Published in Sanity." : "Draft created in Sanity.");
      if (payload.studioUrl) window.open(payload.studioUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Blog Builder</h1>
        <p className="mt-2 text-muted-foreground">Enter the topic and required facts. The prompt asks AI to create the SEO details, outline, metadata, and import-ready Markdown packet.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-[#dfe8e2]">
          <CardHeader>
            <CardTitle>Topic and must-have information</CardTitle>
            <CardDescription>Keep this short. Put anything the article must mention in the large field.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Topic or title idea" value={state.topic} onChange={(value) => update("topic", value)} required />
            <div className="space-y-2">
              <Label htmlFor="mustHave">Must-have information</Label>
              <Textarea
                id="mustHave"
                className="min-h-48"
                placeholder="Facts, procedures, offers, doctors, locations, cautions, source notes, or exact claims that must appear."
                value={state.mustHave}
                onChange={(event) => update("mustHave", event.target.value)}
              />
            </div>
            <Field label="Audience / service area" value={state.audience} onChange={(value) => update("audience", value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" value={state.category} onChange={(value) => update("category", value)} />
              <Field label="Author" value={state.author} onChange={(value) => update("author", value)} />
            </div>
            <Field label="Reviewer, optional" value={state.reviewer} onChange={(value) => update("reviewer", value)} />
            <div className="space-y-2">
              <Label htmlFor="internalLinks">Internal links to include</Label>
              <Textarea id="internalLinks" className="min-h-28" value={state.internalLinks} onChange={(event) => update("internalLinks", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sources">Source URLs, optional</Label>
              <Textarea id="sources" className="min-h-24" placeholder="Paste one source URL per line if there are required sources." value={state.sources} onChange={(event) => update("sources", event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#dfe8e2]">
          <CardHeader>
            <CardTitle>Generated AI prompt</CardTitle>
            <CardDescription>Copy this into GPT. It will generate SEO details and the strict Markdown packet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea className="min-h-[520px] font-mono text-xs" readOnly value={prompt} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyPrompt}>
                <Clipboard /> Copy AI Prompt
              </Button>
              <Button variant="outline" onClick={downloadPrompt}>
                <Download /> Download Prompt
              </Button>
              <Button variant="outline" onClick={() => setMarkdown(packetTemplate(state))}>
                <Upload /> Use packet template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#dfe8e2]">
        <CardHeader>
          <CardTitle>Import Markdown to Sanity</CardTitle>
          <CardDescription>Paste the generated Markdown packet, preview fields, validate, and create a Sanity draft.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" asChild>
            <Label className="cursor-pointer">
              <FileUp /> Upload Markdown File
              <Input
                className="sr-only"
                type="file"
                accept=".md,text/markdown,text/plain"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) setMarkdown(await file.text());
                }}
              />
            </Label>
          </Button>
          <Textarea className="min-h-[320px] font-mono text-xs" placeholder="Paste generated Markdown packet here..." value={markdown} onChange={(event) => setMarkdown(event.target.value)} />

          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Preview Import</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>
            <TabsContent className="space-y-3" value="preview">
              {parsed.packet ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Preview label="Title" value={parsed.packet.title} />
                  <Preview label="Slug" value={parsed.packet.slug} />
                  <Preview label="Category" value={parsed.packet.category} />
                  <Preview label="Meta title" value={parsed.packet.metaTitle} />
                  <Preview label="Meta description" value={parsed.packet.metaDescription} />
                  <Preview label="Tags" value={parsed.packet.tags.join(", ")} />
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No valid preview yet</AlertTitle>
                  <AlertDescription>Paste a complete Markdown packet to preview parsed fields.</AlertDescription>
                </Alert>
              )}
            </TabsContent>
            <TabsContent className="space-y-3" value="validation">
              {parsed.errors.length ? (
                parsed.errors.map((error) => (
                  <Alert key={error} variant="destructive">
                    <AlertTitle>Required field missing</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))
              ) : (
                <Alert>
                  <AlertTitle>Ready to import</AlertTitle>
                  <AlertDescription>The required Markdown packet fields are present.</AlertDescription>
                </Alert>
              )}
              {parsed.warnings.map((warning) => (
                <Badge key={warning} variant="secondary">
                  {warning}
                </Badge>
              ))}
            </TabsContent>
          </Tabs>

          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button disabled={isImporting || !parsed.packet} onClick={() => importMarkdown(false)}>
              {isImporting ? <Loader2 className="animate-spin" /> : <Send />}
              Create Draft in Sanity
            </Button>
            <Button disabled={isImporting || !parsed.packet} variant="outline" onClick={() => importMarkdown(true)}>
              Publish to Sanity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} required={required} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Preview({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || "Not provided"}</p>
    </div>
  );
}

function buildPrompt(state: BuilderState) {
  return `You are an expert healthcare content strategist and SEO editor writing for JourneyLite Physicians.

Write one original, credible, helpful article based on the topic below. You must generate the SEO details yourself: focus keyword, secondary keywords, meta title, meta description, slug, excerpt, reading time, FAQ section, source list, internal link labels, and accessible image alt text.

Output only the strict Markdown packet. Do not use frontmatter. Do not include commentary outside the packet.

Topic:
${state.topic || "[topic]"}

Audience:
${state.audience}

Must-have information:
${state.mustHave || "[required facts, claims, services, cautions, or details]"}

Category:
${state.category}

Author:
${state.author}

Reviewed by:
${state.reviewer || "[blank if no reviewer is provided]"}

Internal links to include naturally:
${state.internalLinks}

Required source URLs or source suggestions:
${state.sources || "Use authoritative healthcare sources where relevant and list them in External Sources."}

Writing requirements:
- Use a helpful, credible, patient-friendly tone.
- Avoid keyword stuffing, unsupported claims, fear-based language, and guaranteed outcomes.
- Include local relevance for Ohio, Kentucky, and Indiana where natural.
- Include practical headings that match search intent.
- Include FAQs.
- Include at least one CTA section.
- Default to 1,200+ words unless the topic clearly needs less.

Strict Markdown packet format:
${packetTemplate(state)}
`;
}

function packetTemplate(state: BuilderState) {
  return `## Content Mode
advanced

## Title
[Public article title]

## Slug
[lowercase-url-slug]

## Resource Type
education

## Category
${state.category}

## Tags
- [tag]
- [tag]
- [tag]

## SEO Focus Keyword
[focus keyword generated by AI]

## Meta Title
[SEO title generated by AI]

## Meta Description
[150-160 character meta description generated by AI]

## Reading Time
[example: 6 min read]

## Author
${state.author}

## Reviewed By
${state.reviewer}

## Excerpt
[1-2 sentence excerpt]

## Featured Image Alt Text
[SEO-friendly accessible alt text]

## Internal Links
- [Label](/contact)

## External Sources
- [Source name](URL)

## Body
[Full Markdown article body]`;
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
