import Link from "next/link";
import { AlertTriangle, BookOpen, CheckCircle2, CircleAlert, MapPin, PenLine, Stethoscope, UserRound, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminContentData } from "@/lib/admin/content";

export default async function AdminDashboardPage() {
  const data = await getAdminContentData();
  const needingReview = data.posts.filter((post) => !post.seoDescription || !post.featuredImageAlt).length;
  const missingMeta = data.posts.filter((post) => !post.seoDescription).length;
  const missingAlt = data.posts.filter((post) => !post.featuredImageAlt).length;
  const categorizedPosts = data.posts.filter((post) => post.category?.name).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-[#153f2b]">Dashboard Overview</h1>
        <p className="mt-3 text-lg text-[#6f8176]">Manage website content, review performance signals, and prepare SEO-ready blog posts.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Published posts" value={data.stats.publishedPosts} detail="Live blog content" icon={CheckCircle2} />
        <StatCard title="Draft posts" value={data.stats.draftPosts} detail="Needs review" icon={PenLine} />
        <StatCard title="Service pages" value={data.services.length} detail="From website data" icon={Stethoscope} />
        <StatCard title="Staff profiles" value={data.staff.length} detail="Provider cards" icon={Users} />
        <StatCard title="Locations" value={data.locations.length} detail="Regional offices" icon={MapPin} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-h-[620px] rounded-xl border-[#dfe8e2] bg-white shadow-sm">
          <CardHeader className="flex-row items-center justify-between border-b border-[#dfe8e2]">
            <div>
              <CardTitle className="text-xl text-[#153f2b]">Recent content updates</CardTitle>
              <CardDescription className="mt-2 text-[#93a69b]">Latest Sanity blog/resource records</CardDescription>
            </div>
            <Link className="text-sm font-semibold text-[#1f6b3c] hover:underline" href="/admin/blog">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#f8faf8]">
                <TableRow>
                  <TableHead className="px-7 text-[#90a296]">Title</TableHead>
                  <TableHead className="text-[#90a296]">Status</TableHead>
                  <TableHead className="text-[#90a296]">Category</TableHead>
                  <TableHead className="text-[#90a296]">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.stats.recentPosts.length ? (
                  data.stats.recentPosts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell className="max-w-md truncate px-7 py-5 font-medium text-[#153f2b]">{post.title}</TableCell>
                      <TableCell>
                        <Badge className={post.status === "published" ? "bg-[#dff2e5] text-[#1f6b3c]" : "bg-[#fff8e8] text-[#b68a2b]"} variant="secondary">
                          {post.status ?? "draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#94a69b]">{post.category?.name ?? "Uncategorized"}</TableCell>
                      <TableCell className="text-[#94a69b]">{formatDate(post.updatedAt || post.publishedAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="px-7 py-8 text-[#94a69b]" colSpan={4}>
                      No Sanity posts were returned. Check Sanity credentials or create a post in Studio.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-xl border-[#dfe8e2] bg-white shadow-sm">
            <CardHeader className="border-b border-[#dfe8e2]">
              <CardTitle className="text-xl text-[#153f2b]">SEO health</CardTitle>
              <CardDescription className="mt-2 text-[#93a69b]">Content readiness checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              <HealthRow tone="amber" label="Posts needing review" value={needingReview} />
              <HealthRow tone="red" label="Missing meta descriptions" value={missingMeta} />
              <HealthRow tone="red" label="Missing image alt text" value={missingAlt} />
              <HealthRow tone="green" label="Posts with categories" value={categorizedPosts} />
              <div className="m-6 rounded-lg border border-[#fec68d] bg-[#fff7ed] p-4 text-[#a65025]">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="size-4" /> Action needed
                </p>
                <p className="mt-2 text-sm leading-6">Add meta descriptions and image alt text to improve SEO readiness.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-[#dfe8e2] bg-white shadow-sm">
            <CardHeader className="border-b border-[#dfe8e2]">
              <CardTitle className="text-xl text-[#153f2b]">Top pages</CardTitle>
              <CardDescription className="mt-2 text-[#93a69b]">Connect analytics for live data</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {["Homepage", "Gastric Sleeve", "Medications", "Blog"].map((page) => (
                <div className="flex items-center justify-between border-b border-[#eef3ef] px-6 py-4 text-[#2d4b39] last:border-0" key={page}>
                  <span className="font-medium">{page}</span>
                  <span className="text-sm text-[#bac9c0]">— views</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-[#dfe8e2] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#153f2b]">Guided work areas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link className="flex items-center gap-3 rounded-lg border border-[#dfe8e2] px-4 py-3 font-medium text-[#153f2b] hover:bg-[#f7faf7]" href="/admin/blog">
                <BookOpen className="size-4" /> Manage blog resources
              </Link>
              <Link className="flex items-center gap-3 rounded-lg border border-[#dfe8e2] px-4 py-3 font-medium text-[#153f2b] hover:bg-[#f7faf7]" href="/admin/staff">
                <UserRound className="size-4" /> Review provider profiles
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HealthRow({ tone, label, value }: { tone: "amber" | "red" | "green"; label: string; value: number }) {
  const toneClass = {
    amber: "bg-[#f28b16]",
    red: "bg-[#e62d31]",
    green: "bg-[#22a957]",
  };
  const badgeClass = {
    amber: "bg-[#fff8e8] text-[#b68a2b]",
    red: "bg-[#fff0f0] text-[#c21f24]",
    green: "bg-[#ecfdf2] text-[#168b45]",
  };

  return (
    <div className="flex items-center justify-between border-b border-[#eef3ef] px-6 py-4 last:border-0">
      <span className="flex items-center gap-3 text-[#455d4f]">
        <CircleAlert className={`size-3 rounded-full ${toneClass[tone]} text-transparent`} />
        {label}
      </span>
      <Badge className={badgeClass[tone]} variant="secondary">
        {value}
      </Badge>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}
