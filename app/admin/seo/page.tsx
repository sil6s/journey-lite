import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { scoreSeo } from "@/lib/seo/scoring";
import { adminClient } from "@/src/lib/sanity/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "SEO — JourneyLite Admin" };
export const dynamic = "force-dynamic";

type SeoRow = {
  id: string;
  type: "Blog" | "Page" | "React";
  title?: string;
  slug?: string;
  path?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  robots?: string;
  bodyText?: string | string[];
  excerpt?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: unknown;
};

export default async function AdminSeoPage() {
  const rows = await adminClient.fetch<SeoRow[]>(
    `[
      ...*[_type == "blogPost"]{
        "id": _id, "type": "Blog", title, "slug": slug.current, seoTitle, seoDescription, focusKeyword,
        "bodyText": coalesce(htmlBody, pt::text(body)), excerpt, ogImage
      },
      ...*[_type == "sitePage"]{
        "id": _id, "type": "Page", title, "slug": slug.current, seoTitle, seoDescription, focusKeyword,
        "bodyText": coalesce(htmlBody, pt::text(sections)), "excerpt": coalesce(heroSubheadline, internalDescription), ogImage
      },
      ...*[_type == "reactPageOverride"]{
        "id": _id, "type": "React", title, path, seoTitle, seoDescription, focusKeyword, robots,
        "bodyText": [headline, summary, contentBlocks[].heading, contentBlocks[].body], ogTitle, ogDescription, ogImage
      }
    ] | order(type asc, title asc)`
  );

  const scored = rows.map((row) => {
    const bodyText = Array.isArray(row.bodyText) ? row.bodyText.flat(2).filter(Boolean).join(" ") : row.bodyText ?? "";
    const url = row.path ?? (row.slug ? row.type === "Blog" ? `/blog/${row.slug}` : `/${row.slug}` : undefined);
    const result = scoreSeo({
      url,
      title: row.seoTitle || row.title,
      description: row.seoDescription || row.excerpt,
      h1Texts: [row.title ?? ""],
      h2Count: Math.max(0, (bodyText.match(/<h2|\n##\s/g) ?? []).length),
      firstParagraph: row.excerpt || bodyText.slice(0, 300),
      bodyText,
      focusKeyword: row.focusKeyword,
      canonicalUrl: url ? `https://journeylite.com${url}` : undefined,
      robots: row.robots ?? "index,follow",
      structuredData: row.type !== "React" || Boolean(row.ogTitle || row.ogDescription),
      ogTitle: row.ogTitle || row.seoTitle || row.title,
      ogDescription: row.ogDescription || row.seoDescription || row.excerpt,
      ogImage: row.ogImage ? "set" : undefined,
    });
    return { ...row, url, result };
  });

  const average = scored.length ? Math.round(scored.reduce((sum, row) => sum + row.result.score, 0) / scored.length) : 0;
  const errors = scored.reduce((sum, row) => sum + row.result.errors.length, 0);
  const warnings = scored.reduce((sum, row) => sum + row.result.warnings.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">SEO</h1>
        <p className="mt-2 text-muted-foreground">100-point on-page SEO scoring for blogs, Sanity pages, and React page overrides.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Average score" value={`${average}/100`} />
        <Metric title="Errors" value={String(errors)} />
        <Metric title="Warnings" value={String(warnings)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pages and posts</CardTitle>
          <CardDescription>Critical errors stay visible even when the numeric score is decent.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Errors</TableHead>
                  <TableHead>Warnings</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scored.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.title || row.url}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{row.seoTitle || "Missing SEO title"}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{row.type}</Badge></TableCell>
                    <TableCell className="min-w-36">
                      <div className="flex items-center gap-3">
                        <Progress value={row.result.score} />
                        <span className="w-12 text-sm font-semibold">{row.result.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>{row.result.errors.length}</TableCell>
                    <TableCell>{row.result.warnings.length}</TableCell>
                    <TableCell>{row.focusKeyword || <span className="text-muted-foreground">Missing</span>}</TableCell>
                    <TableCell className="text-right">
                      {row.url ? <Link className="inline-flex justify-end text-primary" href={row.url} target="_blank"><ExternalLink className="size-4" /></Link> : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardDescription>{title}</CardDescription></CardHeader>
      <CardContent><p className="text-3xl font-semibold">{value}</p></CardContent>
    </Card>
  );
}
