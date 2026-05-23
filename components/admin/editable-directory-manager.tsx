"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Loader2, MoreHorizontal, Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export type EditableDirectoryRow = {
  id: string;
  _id?: string;
  source: "sanity" | "website";
  type: "staff" | "location";
  title: string;
  description?: string;
  group?: string;
  href?: string;
  status?: string;
  meta?: string;
  fields: Record<string, string>;
};

type FieldConfig = {
  name: string;
  label: string;
  type?: "input" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

const staffFields: FieldConfig[] = [
  { name: "name", label: "Name", required: true },
  { name: "displayName", label: "Display name" },
  { name: "primaryTitle", label: "Role / title" },
  { name: "email", label: "Email" },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "clinicalFocus", label: "Clinical focus", type: "textarea", placeholder: "One focus area per line" },
  { name: "education", label: "Education", type: "textarea", placeholder: "One education item per line" },
  { name: "credentials", label: "Credentials", type: "textarea", placeholder: "One credential per line" },
  { name: "imageAlt", label: "Image alt text" },
  { name: "seoTitle", label: "SEO title" },
  { name: "seoDescription", label: "SEO description", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: ["published", "draft", "archived"] },
];

const locationFields: FieldConfig[] = [
  { name: "name", label: "Location name", required: true },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "address1", label: "Address line 1" },
  { name: "address2", label: "Address line 2" },
  { name: "phone", label: "Phone" },
  { name: "hours", label: "Hours", type: "textarea" },
  { name: "mapLink", label: "Map link" },
  { name: "appointmentLink", label: "Appointment link" },
  { name: "serviceArea", label: "Service area text", type: "textarea" },
  { name: "seoTitle", label: "SEO title" },
  { name: "seoDescription", label: "SEO description", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: ["published", "draft", "archived"] },
];

export function EditableDirectoryManager({
  title,
  description,
  rows,
  createLabel,
  type,
}: {
  title: string;
  description: string;
  rows: EditableDirectoryRow[];
  createLabel: string;
  type: "staff" | "location";
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditableDirectoryRow | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const fields = type === "staff" ? staffFields : locationFields;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) =>
      [row.title, row.description, row.group, row.meta, row.source].filter(Boolean).join(" ").toLowerCase().includes(needle),
    );
  }, [query, rows]);

  function openEditor(row?: EditableDirectoryRow) {
    const base = Object.fromEntries(fields.map((field) => [field.name, field.name === "status" ? "published" : ""]));
    setEditing(row ?? {
      id: "new",
      source: "sanity",
      type,
      title: "",
      status: "published",
      fields: base,
    });
    setForm({ ...base, ...(row?.fields ?? {}) });
  }

  function save() {
    startTransition(async () => {
      const endpoint = type === "staff" ? "/api/admin/staff" : "/api/admin/locations";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing?._id, sourceId: editing?.id, fields: form }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        toast.error(payload.error || "Could not save changes.");
        return;
      }
      toast.success(`${type === "staff" ? "Staff profile" : "Location"} saved.`);
      setEditing(null);
      window.location.reload();
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button onClick={() => openEditor()}>
              <Plus />
              {createLabel}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder={`Search ${title.toLowerCase()}...`} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? (
                  filtered.map((row) => (
                    <TableRow key={`${row.source}-${row.id}`}>
                      <TableCell className="align-top">
                        <div className="font-medium">{row.title}</div>
                        {row.description ? <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.description}</div> : null}
                        <Badge className="mt-2" variant={row.source === "sanity" ? "default" : "secondary"}>
                          {row.source === "sanity" ? "Sanity" : "Website fallback"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.status === "published" || row.status === "Published" ? "default" : "secondary"}>{row.status ?? "published"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.meta ?? row.group ?? "Ready for editing"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label={`Actions for ${row.title}`}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditor(row)}>
                              <Pencil /> Edit guided fields
                            </DropdownMenuItem>
                            {row.href ? (
                              <DropdownMenuItem asChild>
                                <Link href={row.href}>
                                  <ExternalLink /> Preview public page
                                </Link>
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="py-8 text-center text-muted-foreground" colSpan={4}>
                      No records match this search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.title ? `Edit ${editing.title}` : createLabel}</DialogTitle>
            <DialogDescription>
              Changes are saved to Sanity. Website fallback records are copied into Sanity the first time you save them.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <div className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"} key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    rows={field.name === "bio" ? 6 : 3}
                    placeholder={field.placeholder}
                    value={form[field.name] ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  />
                ) : field.type === "select" ? (
                  <Select value={form[field.name] || "published"} onValueChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}>
                    <SelectTrigger id={field.name}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options ?? []).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[field.name] ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={isPending} onClick={save}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              Save to Sanity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
