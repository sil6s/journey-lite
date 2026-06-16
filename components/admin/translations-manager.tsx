"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  RefreshCcw,
  Sparkles,
  TriangleAlert,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supportedLanguages } from "@/lib/i18n/config";
import type { LocaleFileStatus, CmsDocRow } from "@/app/api/admin/translations/route";

// ── Types ─────────────────────────────────────────────────────────────────────

type CmsDocGroup = {
  documentId: string;
  documentType: string;
  slug: string;
  updatedAt: string | null;
  locales: Array<{
    locale: string;
    status: string;
    generatedAt: string | null;
    error: string | null;
    updatedAt: string;
  }>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupCmsRows(rows: CmsDocRow[]): CmsDocGroup[] {
  const byDoc = new Map<string, CmsDocGroup>();
  for (const row of rows) {
    if (!byDoc.has(row.source_document_id)) {
      byDoc.set(row.source_document_id, {
        documentId: row.source_document_id,
        documentType: row.source_document_type,
        slug: row.source_slug,
        updatedAt: row.source_updated_at,
        locales: [],
      });
    }
    byDoc.get(row.source_document_id)!.locales.push({
      locale: row.locale,
      status: row.status,
      generatedAt: row.generated_at,
      error: row.error_message,
      updatedAt: row.updated_at,
    });
  }
  return Array.from(byDoc.values());
}

function pctColor(pct: number) {
  if (pct === 100) return "text-emerald-700";
  if (pct >= 80) return "text-amber-600";
  return "text-red-600";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "complete")
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Complete</Badge>;
  if (status === "stale")
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Stale</Badge>;
  if (status === "translating")
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Translating…</Badge>;
  if (status === "error")
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function relTime(dateStr: string | null) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

// ── Locale Files Tab ──────────────────────────────────────────────────────────

function LocaleFilesTab({ initialStatus }: { initialStatus: LocaleFileStatus[] }) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [activeOp, setActiveOp] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const locales = [...new Set(status.map((s) => s.locale))];
  const namespaces = [...new Set(status.map((s) => s.namespace))];

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function refreshStatus() {
    const res = await fetch("/api/admin/translations?tab=locales");
    if (res.ok) {
      const data = await res.json() as { status: LocaleFileStatus[] };
      setStatus(data.status);
    }
  }

  async function autoTranslateOne(locale: string, namespace: string) {
    const res = await fetch("/api/admin/translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "auto-translate", locale, namespace }),
    });
    const data = await res.json() as { ok?: boolean; translated?: number; error?: string };
    if (!data.ok) throw new Error(data.error ?? "Failed");
    return data.translated ?? 0;
  }

  function aiTranslateLocale(locale: string, localeName: string) {
    startTransition(async () => {
      setActiveOp(locale);
      try {
        const missingNs = namespaces.filter((ns) => {
          const row = status.find((r) => r.locale === locale && r.namespace === ns);
          return row && row.missing > 0;
        });
        let total = 0;
        for (const ns of missingNs) {
          total += await autoTranslateOne(locale, ns);
        }
        showToast("ok", `AI translated ${total} string${total !== 1 ? "s" : ""} for ${localeName}.`);
        await refreshStatus();
      } catch (e) {
        showToast("err", e instanceof Error ? e.message : "Translation failed");
      } finally {
        setActiveOp(null);
      }
    });
  }

  // Overall summary per locale
  const summaryByLocale = locales.map((locale) => {
    const rows = status.filter((s) => s.locale === locale);
    const total = rows.reduce((a, r) => a + r.total, 0);
    const translated = rows.reduce((a, r) => a + r.translated, 0);
    const pct = total === 0 ? 100 : Math.round((translated / total) * 100);
    const localeName = supportedLanguages.find((l) => l.id === locale)?.title ?? locale;
    return { locale, localeName, total, translated, missing: total - translated, pct };
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          toast.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {toast.type === "ok" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Translates missing UI strings with Gemini and saves them immediately — no manual steps.</p>
        <Button size="sm" variant="outline" className="h-8" onClick={() => startTransition(() => void refreshStatus())}>
          <RefreshCcw className="size-3.5" /> Refresh
        </Button>
      </div>

      {/* Per-locale cards — AI Translate is the only action needed */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {summaryByLocale.map((s) => (
          <Card key={s.locale} className="border-[#dfe8e2]">
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{s.localeName}</span>
                <span className={`text-sm font-semibold ${pctColor(s.pct)}`}>{s.pct}%</span>
              </div>
              <Progress value={s.pct} className="mb-2 h-1.5" />
              <p className="text-xs text-muted-foreground">
                {s.translated} / {s.total} strings translated
                {s.missing > 0 && <span className="ml-1 text-amber-600">({s.missing} missing)</span>}
              </p>
              <Button
                size="sm"
                className="mt-3 h-8 w-full bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700"
                disabled={s.missing === 0 || isPending}
                onClick={() => aiTranslateLocale(s.locale, s.localeName)}
              >
                {activeOp === s.locale ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                {s.missing === 0 ? "Up to date" : "AI Translate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── CMS Articles Tab ──────────────────────────────────────────────────────────

const NON_ENGLISH = supportedLanguages.filter((l) => !l.isDefault && l.enabled).map((l) => l.id);

function CmsTab({ initialRows }: { initialRows: CmsDocRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [activeOp, setActiveOp] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const groups = groupCmsRows(rows);

  const filtered = groups.filter((g) => {
    if (filterStatus === "all") return true;
    return g.locales.some((l) => l.status === filterStatus);
  });

  const staleCount = groups.filter((g) => g.locales.some((l) => l.status === "stale")).length;
  const errorCount = groups.filter((g) => g.locales.some((l) => l.status === "error")).length;
  const totalDocs = groups.length;

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  async function refreshRows() {
    const res = await fetch("/api/admin/translations?tab=cms");
    if (res.ok) {
      const data = await res.json() as { rows: CmsDocRow[] };
      setRows(data.rows);
    }
  }

  function retrigger(documentId: string) {
    startTransition(async () => {
      setActiveOp(`rt-${documentId}`);
      try {
        const res = await fetch("/api/admin/translations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cms-retrigger", documentId }),
        });
        const data = await res.json() as { ok?: boolean; error?: string };
        if (!data.ok) throw new Error(data.error ?? "Failed");
        showToast("ok", "Re-translation started — refresh in a minute to see results.");
        await refreshRows();
      } catch (e) {
        showToast("err", e instanceof Error ? e.message : "Failed");
      } finally {
        setActiveOp(null);
      }
    });
  }

  function retriggerAllStale() {
    startTransition(async () => {
      setActiveOp("rt-all-stale");
      try {
        const res = await fetch("/api/admin/translations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cms-retrigger-all-stale" }),
        });
        const data = await res.json() as { ok?: boolean; retriggered?: number; error?: string };
        if (!data.ok) throw new Error(data.error ?? "Failed");
        showToast("ok", `Re-triggered ${data.retriggered} stale document(s).`);
        await refreshRows();
      } catch (e) {
        showToast("err", e instanceof Error ? e.message : "Failed");
      } finally {
        setActiveOp(null);
      }
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          toast.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {toast.type === "ok" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Summary strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#dfe8e2] bg-white p-4">
          <p className="text-sm text-muted-foreground">Total CMS docs</p>
          <p className="mt-1 text-2xl font-semibold text-[#153f2b]">{totalDocs}</p>
        </div>
        <div className={`rounded-xl border p-4 ${staleCount > 0 ? "border-amber-200 bg-amber-50" : "border-[#dfe8e2] bg-white"}`}>
          <p className="text-sm text-muted-foreground">Stale translations</p>
          <p className={`mt-1 text-2xl font-semibold ${staleCount > 0 ? "text-amber-700" : "text-[#153f2b]"}`}>{staleCount}</p>
        </div>
        <div className={`rounded-xl border p-4 ${errorCount > 0 ? "border-red-200 bg-red-50" : "border-[#dfe8e2] bg-white"}`}>
          <p className="text-sm text-muted-foreground">Errors</p>
          <p className={`mt-1 text-2xl font-semibold ${errorCount > 0 ? "text-red-700" : "text-[#153f2b]"}`}>{errorCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="stale">Stale</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="translating">Translating</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8" onClick={() => startTransition(() => void refreshRows())}>
            <RefreshCcw className="size-3.5" />
          </Button>
        </div>
        {staleCount > 0 && (
          <Button
            size="sm"
            className="h-8 bg-violet-600 text-white hover:bg-violet-700"
            disabled={isPending}
            onClick={retriggerAllStale}
          >
            {activeOp === "rt-all-stale" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            AI Translate {staleCount} stale doc{staleCount !== 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {/* Document list */}
      <Card className="border-[#dfe8e2]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#dfe8e2] hover:bg-transparent">
                <TableHead className="w-6" />
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source updated</TableHead>
                <TableHead>Locale status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((group) => {
                const isOpen = expanded.has(group.documentId);
                const hasError = group.locales.some((l) => l.status === "error");
                const hasStale = group.locales.some((l) => l.status === "stale");
                const allComplete = group.locales.every((l) => l.status === "complete");

                return [
                  // Main row
                  <TableRow
                    key={group.documentId}
                    className="cursor-pointer border-[#dfe8e2] hover:bg-[#f7faf7]"
                    onClick={() => toggleExpand(group.documentId)}
                  >
                    <TableCell className="py-2">
                      {isOpen
                        ? <ChevronDown className="size-4 text-muted-foreground" />
                        : <ChevronRight className="size-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{group.slug}</p>
                      <p className="text-xs text-muted-foreground font-mono">{group.documentId.slice(0, 14)}…</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{group.documentType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {relTime(group.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {hasError && <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="size-3" /> error</Badge>}
                        {hasStale && !hasError && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><TriangleAlert className="size-3" /> stale</Badge>}
                        {allComplete && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="size-3" /> all complete</Badge>}
                        {!hasError && !hasStale && !allComplete && (
                          <span className="text-xs text-muted-foreground">{group.locales.length} locale{group.locales.length !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-violet-200 px-2 text-xs text-violet-700 hover:bg-violet-50"
                        disabled={isPending}
                        onClick={() => retrigger(group.documentId)}
                      >
                        {activeOp === `rt-${group.documentId}`
                          ? <Loader2 className="size-3 animate-spin" />
                          : <Sparkles className="size-3" />}
                        AI Translate
                      </Button>
                    </TableCell>
                  </TableRow>,

                  // Expanded locale detail
                  ...(isOpen ? [
                    <TableRow key={`${group.documentId}-detail`} className="border-[#dfe8e2] bg-[#f7faf7] hover:bg-[#f7faf7]">
                      <TableCell />
                      <TableCell colSpan={5} className="pb-3 pt-0">
                        <div className="grid gap-1 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                          {NON_ENGLISH.map((locale) => {
                            const localeRow = group.locales.find((l) => l.locale === locale);
                            const langName = supportedLanguages.find((l) => l.id === locale)?.title ?? locale;
                            return (
                              <div key={locale} className="flex items-center justify-between rounded-lg border border-[#dfe8e2] bg-white px-3 py-2 text-sm">
                                <span className="font-medium">{langName} <span className="text-xs text-muted-foreground">({locale})</span></span>
                                {localeRow ? (
                                  <div className="flex flex-col items-end gap-0.5">
                                    <StatusBadge status={localeRow.status} />
                                    <span className="text-xs text-muted-foreground">
                                      {localeRow.status === "complete" ? relTime(localeRow.generatedAt) : relTime(localeRow.updatedAt)}
                                    </span>
                                    {localeRow.error && (
                                      <span className="max-w-48 truncate text-xs text-red-600" title={localeRow.error}>{localeRow.error}</span>
                                    )}
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Not yet translated</Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>,
                  ] : []),
                ];
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <Globe className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {totalDocs === 0
                        ? "No CMS translations yet. Publish a post in Sanity and the webhook will translate it automatically."
                        : "No documents match the current filter."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalDocs === 0 && (
        <div className="rounded-xl border border-[#dfe8e2] bg-[#f7faf7] p-4 text-sm">
          <p className="font-medium text-[#193f2c]">Webhook setup</p>
          <p className="mt-1 text-muted-foreground">
            Go to <strong>Sanity › API › Webhooks</strong> and add a webhook pointing to{" "}
            <code className="rounded bg-muted px-1">https://yoursite.com/api/webhooks/sanity-translate</code>.
            Trigger on Create + Update for <code>blogPost</code>, <code>sitePage</code>, and <code>post</code> types.
            Set <code>SANITY_WEBHOOK_SECRET</code> in your environment to match.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function TranslationsManager({
  localeStatus,
  cmsRows,
}: {
  localeStatus: LocaleFileStatus[];
  cmsRows: CmsDocRow[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Translations</h1>
        <p className="mt-1 text-muted-foreground">
          Manage static page JSON translations and CMS content translations.
        </p>
      </div>

      <Tabs defaultValue="locales">
        <TabsList>
          <TabsTrigger value="locales">
            <Globe className="size-4" />
            Locale Files
          </TabsTrigger>
          <TabsTrigger value="cms">
            <Sparkles className="size-4" />
            CMS Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locales" className="mt-6">
          <LocaleFilesTab initialStatus={localeStatus} />
        </TabsContent>

        <TabsContent value="cms" className="mt-6">
          <CmsTab initialRows={cmsRows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
