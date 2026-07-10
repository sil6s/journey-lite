import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookConsultButton } from "@/components/site/BookConsultButton";
import { CTAButton, SiteFooter, SiteHeader } from "../components/marketing";
import { client } from "@/src/lib/sanity/client";
import { categoriesQuery, newPostsQuery, migratedPostsQuery } from "@/src/lib/sanity/queries";
import type { BlogCategory, BlogPost } from "@/src/lib/sanity/types";
import { urlFor } from "@/src/lib/sanity/image";
import { getReactPageMetadata } from "@/lib/site/overrides";

export const revalidate = 30;

const fallbackMetadata: Metadata = {
  title: "Weight Loss Blog | JourneyLite",
  description:
    "Read JourneyLite articles about bariatric surgery, gastric balloon treatment, prescription weight loss medications, pricing, and patient preparation.",
};

export function generateMetadata() {
  return getReactPageMetadata("/blog", fallbackMetadata);
}

type BlogPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

const ARCHIVE_PREVIEW = 9;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await (searchParams ?? Promise.resolve({ category: undefined }));

  const [newPosts, archivedPosts, categories] = await Promise.all([
    client.fetch<BlogPost[]>(newPostsQuery, { category: category ?? null }, { next: { revalidate } }),
    client.fetch<BlogPost[]>(migratedPostsQuery, { category: category ?? null }, { next: { revalidate } }),
    client.fetch<BlogCategory[]>(categoriesQuery, {}, { next: { revalidate } }),
  ]);

  const [featuredPost, ...remainingNewPosts] = newPosts;
  const archivePreview = archivedPosts.slice(0, ARCHIVE_PREVIEW);

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="bg-[#f7f8f6] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow">JourneyLite Blog</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
              Weight Loss Education & Patient Resources
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#53635b]">
              Practical guidance on bariatric surgery, non-surgical weight loss, medications, pricing, and long-term
              support from the JourneyLite care team.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BookConsultButton />
              <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                Compare Options
              </CTAButton>
            </div>
          </div>
        </section>

        {/* ── Category filter ────────────────────────────────── */}
        <div className="sticky top-16 z-10 border-b border-[#dce4df] bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl overflow-x-auto px-5 py-3 lg:px-8">
            <div className="flex gap-2 pb-0.5" aria-label="Filter articles by category">
              <FilterChip href="/blog" active={!category} label="All articles" />
              {categories.map((cat) =>
                cat.slug ? (
                  <FilterChip
                    key={cat.slug}
                    href={`/blog?category=${cat.slug}`}
                    active={category === cat.slug}
                    label={cat.name ?? cat.slug}
                  />
                ) : null,
              )}
            </div>
          </div>
        </div>

        {/* ── New articles ───────────────────────────────────── */}
        <section className="bg-white py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-8 flex items-baseline gap-4">
              <p className="eyebrow">New articles</p>
              {category ? (
                <span className="text-sm text-[#64736b]">Filtered by: {categories.find(c => c.slug === category)?.name ?? category}</span>
              ) : null}
            </div>

            {featuredPost ? (
              <>
                <article className="grid overflow-hidden rounded-2xl border border-[#dce4df] bg-[#f8fbf9] shadow-xl shadow-[#20372b]/8 lg:grid-cols-[0.95fr_1.05fr]">
                  <BlogImage className="h-72 lg:h-full" post={featuredPost} priority />
                  <div className="p-6 lg:p-8">
                    <p className="eyebrow">{featuredPost.category?.name ?? "Featured article"}</p>
                    <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">{featuredPost.title}</h2>
                    {featuredPost.excerpt ? <p className="mt-4 text-base leading-7 text-[#53635b]">{featuredPost.excerpt}</p> : null}
                    <p className="mt-5 text-sm font-semibold text-[#64736b]">{formatDate(featuredPost.publishedAt)}</p>
                    <Link
                      className="mt-6 inline-flex rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
                      href={`/blog/${featuredPost.slug}`}
                    >
                      Read article
                    </Link>
                  </div>
                </article>

                {remainingNewPosts.length ? (
                  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {remainingNewPosts.map((post) => (
                      <BlogCard key={post._id} post={post} />
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-[#dce4df] bg-[#f8fbf9] p-8">
                <p className="text-xl font-semibold text-[#1f2c25]">No new articles yet{category ? " in this category" : ""}.</p>
                <p className="mt-2 text-sm text-[#53635b]">
                  {category ? "Try browsing all categories or check the archive below." : "New posts published by the JourneyLite team will appear here."}
                </p>
                {category ? (
                  <Link className="mt-4 inline-flex rounded-md border border-[#cbd7d0] bg-white px-4 py-2 text-sm font-semibold text-[#17362a] hover:border-[#145c42]" href="/blog">
                    Clear filter
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </section>

        {/* ── Archive section ────────────────────────────────── */}
        <section className="border-t-4 border-[#d4c97a] bg-[#fffae8] py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="eyebrow text-[#7a6628]">From the archive</p>
                <h2 className="mt-1 font-serif text-3xl leading-tight text-[#3b3210] md:text-4xl">
                  Legacy Blog Posts
                </h2>
                <p className="mt-2 text-sm text-[#9a8240]">
                  Migrated from the previous JourneyLite WordPress blog — formatting may not be perfect.
                </p>
              </div>
              {archivedPosts.length > ARCHIVE_PREVIEW ? (
                <Link
                  className="mt-4 shrink-0 rounded-full border border-[#c9b86e] bg-white px-5 py-2 text-sm font-semibold text-[#5c4d1a] hover:border-[#5c4d1a] sm:mt-0"
                  href={category ? `/blog/legacy?category=${category}` : "/blog/legacy"}
                >
                  View all {archivedPosts.length} archived posts →
                </Link>
              ) : null}
            </div>

            {archivePreview.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {archivePreview.map((post) => (
                  <ArchiveCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-[#d4c97a] bg-white p-8 text-center">
                <p className="text-lg font-semibold text-[#3b3210]">No archived posts{category ? " in this category" : ""}.</p>
              </div>
            )}

            {archivedPosts.length > ARCHIVE_PREVIEW ? (
              <div className="mt-8 text-center">
                <Link
                  className="inline-flex rounded-full border border-[#c9b86e] bg-white px-8 py-3 text-sm font-semibold text-[#5c4d1a] hover:border-[#5c4d1a]"
                  href={category ? `/blog/legacy?category=${category}` : "/blog/legacy"}
                >
                  Browse all {archivedPosts.length} archived posts
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl rounded-2xl border border-[#dce4df] bg-[#f8fbf9] px-5 py-8 lg:px-8">
            <p className="eyebrow">Next step</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-[#1f2c25]">
              Have questions about your weight loss options?
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#53635b]">
              JourneyLite can help you compare surgical procedures, non-surgical options, medication-supported care,
              pricing, and locations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BookConsultButton />
              <CTAButton href="/services/compare-weight-loss-options" variant="secondary">Compare Options</CTAButton>
              <CTAButton href="/services/pricing-financing" variant="secondary">Pricing & Financing</CTAButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
        active
          ? "border-[#145c42] bg-[#145c42] text-white"
          : "border-[#cbd7d0] bg-white text-[#17362a] hover:border-[#145c42]"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <BlogImage className="h-52" post={post} />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">
          {post.category?.name ?? "JourneyLite article"}
        </p>
        <h3 className="mt-3 text-xl font-semibold leading-tight text-[#1f2c25]">{post.title}</h3>
        {post.excerpt ? <p className="mt-3 text-sm leading-6 text-[#53635b] line-clamp-3">{post.excerpt}</p> : null}
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#64736b]">{formatDate(post.publishedAt)}</p>
        <Link
          className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline"
          href={`/blog/${post.slug}`}
        >
          Read more
        </Link>
      </div>
    </article>
  );
}

function ArchiveCard({ post }: { post: BlogPost }) {
  const imageUrl = post.featuredImage
    ? urlFor(post.featuredImage).width(700).height(400).fit("crop").url()
    : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#d4c97a] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {imageUrl ? (
        <Image
          alt={post.featuredImageAlt || post.title}
          className="h-44 w-full object-cover"
          height={400}
          src={imageUrl}
          width={700}
        />
      ) : (
        <div className="h-44 bg-[#f0e8c8]" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a6628]">
          {post.category?.name ?? "Archive"}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-tight text-[#1f2c25]">{post.title}</h3>
        {post.excerpt ? <p className="mt-2 text-sm leading-6 text-[#53635b] line-clamp-2">{post.excerpt}</p> : null}
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#9a8240]">{formatDate(post.publishedAt)}</p>
        <Link
          className="mt-auto inline-flex pt-4 text-sm font-semibold text-[#7a6628] underline-offset-4 hover:underline"
          href={`/blog/${post.slug}`}
        >
          Read more
        </Link>
      </div>
    </article>
  );
}

function BlogImage({ post, className, priority = false }: { post: BlogPost; className: string; priority?: boolean }) {
  if (!post.featuredImage) return <div className={`${className} bg-[#dce8e1]`} />;
  return (
    <Image
      alt={post.featuredImageAlt || post.title}
      className={`${className} w-full object-cover`}
      height={520}
      priority={priority}
      src={urlFor(post.featuredImage).width(900).height(580).fit("crop").url()}
      width={900}
    />
  );
}

function formatDate(date?: string) {
  if (!date) return "Date pending";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date));
}
