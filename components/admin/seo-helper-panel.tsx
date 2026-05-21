import { CheckCircle2, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SeoHelperPanel({
  focusKeyword,
  metaTitle,
  metaDescription,
  slug,
  excerpt,
  internalLinks,
  externalLinks,
  imageAlt,
  wordCount,
  suggestedSchema,
}: {
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  excerpt?: string;
  internalLinks?: number;
  externalLinks?: number;
  imageAlt?: string;
  wordCount?: number;
  suggestedSchema?: string;
}) {
  const checks = [
    { label: "Focus keyword", ok: Boolean(focusKeyword) },
    { label: "Meta title", ok: Boolean(metaTitle && metaTitle.length <= 70) },
    { label: "Meta description", ok: Boolean(metaDescription && metaDescription.length <= 170) },
    { label: "Readable slug", ok: Boolean(slug && slug.length <= 96) },
    { label: "Excerpt", ok: Boolean(excerpt && excerpt.length >= 40) },
    { label: "Internal links", ok: (internalLinks ?? 0) > 0 },
    { label: "External sources", ok: (externalLinks ?? 0) > 0 },
    { label: "Image alt text", ok: Boolean(imageAlt && imageAlt.length >= 8) },
  ];
  const score = Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>SEO helper</CardTitle>
          <Badge variant={score >= 75 ? "default" : "secondary"}>{score}% ready</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={score} />
        <div className="grid gap-2">
          {checks.map((check) => (
            <div className="flex items-center justify-between gap-3 text-sm" key={check.label}>
              <span className="text-muted-foreground">{check.label}</span>
              {check.ok ? <CheckCircle2 className="size-4 text-primary" /> : <CircleAlert className="size-4 text-amber-600" />}
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Meta title: {metaTitle?.length ?? 0}/70. Meta description: {metaDescription?.length ?? 0}/170. Content length:{" "}
          {wordCount ?? 0} words. Suggested schema: {suggestedSchema ?? "Article"}.
        </div>
      </CardContent>
    </Card>
  );
}
