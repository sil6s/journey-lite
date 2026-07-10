import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/marketing";
import { client } from "@/src/lib/sanity/client";
import { migratedPostsQuery } from "@/src/lib/sanity/queries";
import type { BlogPost } from "@/src/lib/sanity/types";
import { urlFor } from "@/src/lib/sanity/image";
import { getReactPageMetadata } from "@/lib/site/overrides";

export const revalidate = 60;

const fallbackMetadata: Metadata = {
  title: "Archived Blog Posts | JourneyLite",
  description:
    "Articles migrated from the previous JourneyLite WordPress blog. Content is preserved as-is — formatting may not be perfect.",
  robots: { index: false },
};

export function generateMetadata() {
  return getReactPageMetadata("/blog/legacy", fallbackMetadata);
}

type LegacyPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function LegacyBlogPage({ searchParams }: LegacyPageProps) {
  const { category } = await (searchParams ?? Promise.resolve({ category: undefined }));
  const posts = await client.fetch<BlogPost[]>(migratedPostsQuery, { category: category ?? null }, { next: { revalidate } });

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#fffae8] border-b border-[#d4c97a] py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Link
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5c4d1a] underline-offset-4 hover:underline"
              href="/blog"
            >
              ← Back to blog
            </Link>
            <h1 className="mt-2 max-w-4xl font-serif text-5xl leading-[1.05] text-[#3b3210] md:text-6xl">
              Archived Posts
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#7a6628]">
              These articles were migrated from the previous JourneyLite WordPress blog. Content is preserved as-is
              — formatting may not be perfect and some images may be missing.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#9a8240]">
              {posts.length} archived {posts.length === 1 ? "article" : "articles"}
            </p>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {posts.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <LegacyCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#dce4df] bg-[#f8fbf9] p-8 text-center">
                <p className="text-lg font-semibold text-[#1f2c25]">No archived posts yet.</p>
                <p className="mt-2 text-sm text-[#53635b]">
                  Migrated posts will appear here once the import and patch scripts have run.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function LegacyCard({ post }: { post: BlogPost }) {
  const imageUrl = post.featuredImage
    ? urlFor(post.featuredImage).width(700).height(420).fit("crop").url()
    : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {imageUrl ? (
        <Image
          alt={post.featuredImageAlt || post.title}
          className="h-48 w-full object-cover"
          height={420}
          src={imageUrl}
          width={700}
        />
      ) : (
        <div className="h-48 bg-[#dce8e1]" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a6628]">
          {post.category?.name ?? "Archive"}
        </p>
        <h2 className="mt-3 text-xl font-semibold leading-tight text-[#1f2c25]">{post.title}</h2>
        {post.excerpt ? <p className="mt-3 text-sm leading-6 text-[#53635b] line-clamp-3">{post.excerpt}</p> : null}
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#64736b]">
          {formatDate(post.publishedAt)}
        </p>
        <Link
          className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
          href={`/blog/${post.slug}`}
        >
          Read more
        </Link>
      </div>
    </article>
  );
}

function formatDate(date?: string) {
  if (!date) return "Date pending";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
