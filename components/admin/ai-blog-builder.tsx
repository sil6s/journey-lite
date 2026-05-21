"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, FileUp, Loader2, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { parseBlogPacket } from "@/lib/markdown/parseBlogPacket";

const steps = [
  "Topic & Intent",
  "Audience & Service Area",
  "SEO Details",
  "Credibility & Sources",
  "Content Structure",
  "CTA & Internal Links",
  "Generate Prompt",
  "Import Markdown",
];

type BuilderState = Record<string, string | boolean>;

const initialState: BuilderState = {
  titleIdea: "",
  mainTopic: "",
  searchIntent: "Informational",
  contentGoal: "Educate and encourage a consultation request",
  primaryCta: "Book Consultation",
  resourceType: "education",
  category: "",
  tags: "",
  targetAudience: "Adults comparing weight loss care options",
  serviceArea: "Ohio, Kentucky, and Indiana",
  patientType: "",
  painPoints: "",
  questions: "",
  tone: "Helpful, credible, patient-friendly, plain language",
  focusKeyword: "",
  secondaryKeywords: "",
  localSeoTerms: "",
  metaTitle: "",
  metaDescription: "",
  slug: "",
  imageAlt: "",
  internalTargets: "",
  externalSources: "",
  requiredFacts: "",
  requiredStats: "",
  sourceUrls: "",
  reviewer: "",
  author: "JourneyLite Physicians",
  disclaimer: "Include a concise medical disclaimer for educational content.",
  lastReviewed: "",
  requiredSections: "",
  faqs: "",
  comparisonTable: false,
  checklist: true,
  visualCallouts: "",
  wordCount: "1200",
  requiredHeadings: "",
  thingsToAvoid: "Keyword stuffing, unsupported claims, fear-based language, promises of guaranteed outcomes",
  primaryCtaText: "Book Consultation",
  secondaryCtaText: "Compare Weight Loss Options",
  appointmentLink: "/contact",
  relatedServices: "/services/compare-weight-loss-options\n/services/gastric-sleeve\n/services/gastric-balloon\n/medications",
  relatedPosts: "/blog",
  locationPages: "/#locations",
  footerCta: "Schedule a consultation with JourneyLite to compare options with a care team.",
};

export function AiBlogBuilder() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<BuilderState>(initialState);
  const [markdown, setMarkdown] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const prompt = useMemo(() => buildPrompt(state), [state]);
  const parsed = useMemo(() => parseBlogPacket(markdown), [markdown]);

  const progress = ((step + 1) / steps.length) * 100;

  function update(key: string, value: string | boolean) {
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
        <p className="mt-2 text-muted-foreground">Create a structured, SEO-ready prompt and import GPT-generated Markdown into Sanity.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">{steps[step]}</span>
            <span className="text-muted-foreground">Step {step + 1} of {steps.length}</span>
          </div>
          <Progress value={progress} />
          <div className="mt-4 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
            {steps.map((item, index) => (
              <Button key={item} size="sm" variant={index === step ? "default" : "outline"} onClick={() => setStep(index)}>
                {index < step ? <Check /> : null}
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {step === 0 ? (
        <WizardCard title="Topic & Intent" description="Define what the article should accomplish.">
          <Field label="Blog title idea" id="titleIdea" value={state.titleIdea} update={update} />
          <Field label="Main topic" id="mainTopic" value={state.mainTopic} update={update} />
          <Field label="User search intent" id="searchIntent" value={state.searchIntent} update={update} />
          <Field label="Content goal" id="contentGoal" value={state.contentGoal} update={update} />
          <Field label="Primary CTA" id="primaryCta" value={state.primaryCta} update={update} />
          <Field label="Resource type" id="resourceType" value={state.resourceType} update={update} />
          <Field label="Category" id="category" value={state.category} update={update} />
          <Field label="Tags" id="tags" value={state.tags} update={update} textarea />
        </WizardCard>
      ) : null}

      {step === 1 ? (
        <WizardCard title="Audience & Service Area" description="Keep the article specific to the people JourneyLite serves.">
          <Field label="Target audience" id="targetAudience" value={state.targetAudience} update={update} />
          <Field label="Location/service area" id="serviceArea" value={state.serviceArea} update={update} />
          <Field label="Customer/patient type" id="patientType" value={state.patientType} update={update} />
          <Field label="Pain points" id="painPoints" value={state.painPoints} update={update} textarea />
          <Field label="Questions the article should answer" id="questions" value={state.questions} update={update} textarea />
          <Field label="Reading level/tone" id="tone" value={state.tone} update={update} />
        </WizardCard>
      ) : null}

      {step === 2 ? (
        <WizardCard title="SEO Details" description="Set metadata and linking requirements before generating.">
          <Field label="Focus keyword" id="focusKeyword" value={state.focusKeyword} update={update} />
          <Field label="Secondary keywords" id="secondaryKeywords" value={state.secondaryKeywords} update={update} textarea />
          <Field label="Local SEO terms" id="localSeoTerms" value={state.localSeoTerms} update={update} textarea />
          <Field label="Meta title" id="metaTitle" value={state.metaTitle} update={update} />
          <Field label="Meta description" id="metaDescription" value={state.metaDescription} update={update} textarea />
          <Field label="Suggested slug" id="slug" value={state.slug} update={update} />
          <Field label="Image alt text" id="imageAlt" value={state.imageAlt} update={update} />
          <Field label="Internal link targets" id="internalTargets" value={state.internalTargets} update={update} textarea />
          <Field label="External authority source suggestions" id="externalSources" value={state.externalSources} update={update} textarea />
        </WizardCard>
      ) : null}

      {step === 3 ? (
        <WizardCard title="Credibility & Sources" description="Capture facts, claims, reviewers, and source constraints.">
          <Field label="Required facts or claims" id="requiredFacts" value={state.requiredFacts} update={update} textarea />
          <Field label="Required statistics" id="requiredStats" value={state.requiredStats} update={update} textarea />
          <Field label="Source URLs" id="sourceUrls" value={state.sourceUrls} update={update} textarea />
          <Field label="Expert reviewer" id="reviewer" value={state.reviewer} update={update} />
          <Field label="Author" id="author" value={state.author} update={update} />
          <Field label="Medical/professional disclaimer" id="disclaimer" value={state.disclaimer} update={update} textarea />
          <Field label="Last reviewed date" id="lastReviewed" value={state.lastReviewed} update={update} />
        </WizardCard>
      ) : null}

      {step === 4 ? (
        <WizardCard title="Content Structure" description="Guide headings, sections, FAQs, tables, and exclusions.">
          <Field label="Required sections" id="requiredSections" value={state.requiredSections} update={update} textarea />
          <Field label="FAQs" id="faqs" value={state.faqs} update={update} textarea />
          <Toggle label="Comparison table needed" id="comparisonTable" value={Boolean(state.comparisonTable)} update={update} />
          <Toggle label="Checklist needed" id="checklist" value={Boolean(state.checklist)} update={update} />
          <Field label="Visual callout ideas" id="visualCallouts" value={state.visualCallouts} update={update} textarea />
          <Field label="Minimum word count" id="wordCount" value={state.wordCount} update={update} />
          <Field label="Required headings" id="requiredHeadings" value={state.requiredHeadings} update={update} textarea />
          <Field label="Things to avoid" id="thingsToAvoid" value={state.thingsToAvoid} update={update} textarea />
        </WizardCard>
      ) : null}

      {step === 5 ? (
        <WizardCard title="CTA & Internal Links" description="Define conversion points and related website paths.">
          <Field label="Primary CTA text" id="primaryCtaText" value={state.primaryCtaText} update={update} />
          <Field label="Secondary CTA text" id="secondaryCtaText" value={state.secondaryCtaText} update={update} />
          <Field label="Appointment/contact link" id="appointmentLink" value={state.appointmentLink} update={update} />
          <Field label="Related service pages" id="relatedServices" value={state.relatedServices} update={update} textarea />
          <Field label="Related blog posts" id="relatedPosts" value={state.relatedPosts} update={update} textarea />
          <Field label="Location pages" id="locationPages" value={state.locationPages} update={update} textarea />
          <Field label="Footer CTA" id="footerCta" value={state.footerCta} update={update} textarea />
        </WizardCard>
      ) : null}

      {step === 6 ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate Prompt</CardTitle>
            <CardDescription>Copy this prompt into GPT. The response should be only the Markdown packet.</CardDescription>
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
              <Button variant="outline" onClick={() => setStep(7)}>
                Paste Generated Markdown
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 7 ? (
        <Card>
          <CardHeader>
            <CardTitle>Import Markdown to Sanity</CardTitle>
            <CardDescription>Paste or upload GPT output, preview parsed fields, and create a Sanity draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
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
              <Button variant="outline" onClick={() => setMarkdown(promptTemplateFromState(state))}>
                <Upload /> Paste packet template
              </Button>
            </div>
            <Textarea className="min-h-[340px] font-mono text-xs" placeholder="Paste generated Markdown packet here..." value={markdown} onChange={(event) => setMarkdown(event.target.value)} />

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
                    <Preview label="Tags" value={parsed.packet.tags.join(", ")} />
                    <Preview label="Meta title" value={parsed.packet.metaTitle} />
                    <Preview label="Meta description" value={parsed.packet.metaDescription} />
                    <Preview label="Author" value={parsed.packet.author} />
                    <Preview label="Reviewed by" value={parsed.packet.reviewedBy || "None"} />
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
      ) : null}

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>
          Back
        </Button>
        <Button disabled={step === steps.length - 1} onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}>
          Next
        </Button>
      </div>
    </div>
  );
}

function WizardCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  id,
  value,
  update,
  textarea = false,
}: {
  label: string;
  id: string;
  value: string | boolean;
  update: (key: string, value: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className={textarea ? "md:col-span-2" : ""}>
      <Label htmlFor={id}>{label}</Label>
      {textarea ? (
        <Textarea id={id} className="mt-2 min-h-24" value={String(value)} onChange={(event) => update(id, event.target.value)} />
      ) : (
        <Input id={id} className="mt-2" value={String(value)} onChange={(event) => update(id, event.target.value)} />
      )}
    </div>
  );
}

function Toggle({
  label,
  id,
  value,
  update,
}: {
  label: string;
  id: string;
  value: boolean;
  update: (key: string, value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium">
      <Checkbox checked={value} onCheckedChange={(checked) => update(id, Boolean(checked))} />
      {label}
    </label>
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

Create an original, helpful, credible, non-spammy long-form article. Output only the strict Markdown packet shown below. Do not include frontmatter, commentary, code fences, or unsupported sections.

Business/site voice:
- ${state.tone}
- Audience: ${state.targetAudience}
- Service area: ${state.serviceArea}
- Patient/customer type: ${state.patientType}

Topic and intent:
- Blog title idea: ${state.titleIdea}
- Main topic: ${state.mainTopic}
- Search intent: ${state.searchIntent}
- Content goal: ${state.contentGoal}
- Resource type: ${state.resourceType}
- Category: ${state.category}
- Tags: ${state.tags}

SEO requirements:
- Focus keyword: ${state.focusKeyword}
- Secondary keywords: ${state.secondaryKeywords}
- Local SEO terms: ${state.localSeoTerms}
- Meta title: ${state.metaTitle}
- Meta description: ${state.metaDescription}
- Suggested slug: ${state.slug}
- Featured image alt text: ${state.imageAlt}
- Minimum length: ${state.wordCount || "1200"} words
- Use the focus keyword naturally. Avoid keyword stuffing.

Credibility requirements:
- Required facts or claims: ${state.requiredFacts}
- Required statistics: ${state.requiredStats}
- Source URLs: ${state.sourceUrls}
- External authority source suggestions: ${state.externalSources}
- Expert reviewer: ${state.reviewer}
- Author: ${state.author}
- Disclaimer: ${state.disclaimer}
- Last reviewed date: ${state.lastReviewed}
- Avoid unsupported claims and guaranteed outcome language.

Structure requirements:
- Required sections: ${state.requiredSections}
- Required headings: ${state.requiredHeadings}
- Questions/FAQs to answer: ${state.questions || state.faqs}
- Include FAQ section.
- Include comparison table: ${state.comparisonTable ? "yes" : "no"}
- Include checklist: ${state.checklist ? "yes" : "no"}
- Visual callout ideas: ${state.visualCallouts}
- Things to avoid: ${state.thingsToAvoid}

CTA and linking:
- Primary CTA text: ${state.primaryCtaText}
- Secondary CTA text: ${state.secondaryCtaText}
- Appointment/contact link: ${state.appointmentLink}
- Related service pages: ${state.relatedServices}
- Related blog posts: ${state.relatedPosts}
- Location pages: ${state.locationPages}
- Footer CTA: ${state.footerCta}
- Include internal links using Markdown link syntax and provided URLs.
- Include authoritative external sources in the External Sources section.

Strict Markdown packet format:
${promptTemplateFromState(state)}
`;
}

function promptTemplateFromState(state: BuilderState) {
  return `## Content Mode
advanced

## Title
${state.titleIdea}

## Slug
${state.slug}

## Resource Type
${state.resourceType}

## Category
${state.category}

## Tags
${String(state.tags)
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => `- ${tag}`)
    .join("\n")}

## SEO Focus Keyword
${state.focusKeyword}

## Meta Title
${state.metaTitle}

## Meta Description
${state.metaDescription}

## Reading Time
6 min read

## Author
${state.author}

## Reviewed By
${state.reviewer}

## Excerpt
[1-2 sentence excerpt]

## Featured Image Alt Text
${state.imageAlt}

## Internal Links
${String(state.relatedServices)
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => `- [Related page](${url})`)
    .join("\n")}

## External Sources
${String(state.sourceUrls || state.externalSources)
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => `- [Source](${url})`)
    .join("\n")}

## Body
[Full Markdown article body with H2/H3 headings, lists, links, FAQs, CTA sections, and source-aware claims]`;
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
