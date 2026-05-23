"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive, Copy, ExternalLink, MoreHorizontal, Pencil, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminAuthor, AdminBlogPost } from "@/lib/admin/content";
import type { BlogCategory } from "@/src/lib/sanity/types";

type SortKey = "publishedAt" | "updatedAt" | "title" | "readingTime";

export function BlogAdminTable({
  posts,
  categories,
  authors,
}: {
  posts: AdminBlogPost[];
  categories: BlogCategory[];
  authors: AdminAuthor[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [author, setAuthor] = useState("all");
  const [sort, setSort] = useState<SortKey>("publishedAt");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...posts]
      .filter((post) => {
        const haystack = [
          post.title,
          post.slug,
          post.category?.name,
          post.author?.name,
          post.tags?.join(" "),
          post.seoTitle,
          post.seoDescription,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return !needle || haystack.includes(needle);
      })
      .filter((post) => status === "all" || (post.status ?? "draft") === status)
      .filter((post) => category === "all" || post.category?.slug === category)
      .filter((post) => author === "all" || post.author?.name === author)
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "readingTime") return (b.readingTime ?? 0) - (a.readingTime ?? 0);
        return new Date(b[sort] ?? 0).getTime() - new Date(a[sort] ?? 0).getTime();
      });
  }, [author, category, posts, query, sort, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetPaging() {
    setPage(1);
    setSelected([]);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <CardTitle>Blog / Resources</CardTitle>
            <CardDescription>Search, filter, review SEO metadata, and jump to the public page or Studio.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/ai-blog-builder">Create with AI</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/studio/desk/blogPost">Open in Studio</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search title, slug, category, tag, author..." value={query} onChange={(event) => {
              setQuery(event.target.value);
              resetPaging();
            }} />
          </div>
          <Select value={status} onValueChange={(value) => {
            setStatus(value);
            resetPaging();
          }}>
            <SelectTrigger aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(value) => {
            setCategory(value);
            resetPaging();
          }}>
            <SelectTrigger aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((item) =>
                item.slug ? (
                  <SelectItem key={item.slug} value={item.slug}>
                    {item.name}
                  </SelectItem>
                ) : null,
              )}
            </SelectContent>
          </Select>
          <Select value={author} onValueChange={(value) => {
            setAuthor(value);
            resetPaging();
          }}>
            <SelectTrigger aria-label="Filter by author">
              <SelectValue placeholder="Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All authors</SelectItem>
              {authors.map((item) =>
                item.name ? (
                  <SelectItem key={item._id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ) : null,
              )}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => {
            setSort(value as SortKey);
            resetPaging();
          }}>
            <SelectTrigger aria-label="Sort posts">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publishedAt">Publish date</SelectItem>
              <SelectItem value="updatedAt">Updated date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="readingTime">Reading time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selected.length ? (
          <div className="flex items-center justify-between rounded-lg border bg-muted/60 px-3 py-2 text-sm">
            <span>{selected.length} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Archive selected
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelected([])}>
                Clear
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} of {filtered.length} posts
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <span className="min-w-24 text-center">Page {page} of {pageCount}</span>
            <Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
              Next
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all posts"
                    checked={pageRows.length > 0 && selected.length === pageRows.length}
                    onCheckedChange={(checked) => setSelected(checked ? pageRows.map((post) => post._id) : [])}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish date</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>SEO keyword</TableHead>
                <TableHead>Read</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11}>
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                      <p className="pt-2 text-sm text-muted-foreground">No posts returned from Sanity yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length ? (
                pageRows.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>
                      <Checkbox
                        aria-label={`Select ${post.title}`}
                        checked={selected.includes(post._id)}
                        onCheckedChange={(checked) =>
                          setSelected((current) => (checked ? [...current, post._id] : current.filter((id) => id !== post._id)))
                        }
                      />
                    </TableCell>
                    <TableCell className="min-w-72 font-medium">{post.title}</TableCell>
                    <TableCell className="text-muted-foreground">{post.slug}</TableCell>
                    <TableCell>{post.category?.name ?? "None"}</TableCell>
                    <TableCell>{post.author?.name ?? "JourneyLite"}</TableCell>
                    <TableCell>
                      <Badge variant={(post.status ?? "draft") === "published" ? "default" : "secondary"}>{post.status ?? "draft"}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(post.publishedAt)}</TableCell>
                    <TableCell>{formatDate(post.updatedAt)}</TableCell>
                    <TableCell>{post.seoTitle ? <span className="text-xs">{post.seoTitle}</span> : <Badge variant="outline">missing</Badge>}</TableCell>
                    <TableCell>{post.readingTime ?? "?"} min</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label={`Actions for ${post.title}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Content actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${post.slug}`}>
                              <ExternalLink /> Open public URL
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/studio/desk/blogPost;${post._id}`}>
                              <Pencil /> Edit in Studio
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy /> Duplicate content
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive /> Archive / unpublish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="py-8 text-center text-muted-foreground" colSpan={11}>
                    No posts match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(date?: string) {
  if (!date) return "Pending";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}
