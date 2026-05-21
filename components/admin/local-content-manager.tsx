"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, MoreHorizontal, Pencil, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type LocalContentRow = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  group?: string;
  href?: string;
  meta?: string;
};

export function LocalContentManager({
  title,
  description,
  rows,
  createLabel = "Create new",
}: {
  title: string;
  description: string;
  rows: LocalContentRow[];
  createLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) =>
      [row.title, row.description, row.group, row.meta].filter(Boolean).join(" ").toLowerCase().includes(needle),
    );
  }, [query, rows]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button>
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
                <TableHead>Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.title}</div>
                      {row.description ? <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.description}</div> : null}
                    </TableCell>
                    <TableCell>{row.group ?? "Website"}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === "Published" ? "default" : "secondary"}>{row.status ?? "Published"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.meta ?? "Ready for guided editing"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label={`Actions for ${row.title}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
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
                  <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                    No records match this search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
