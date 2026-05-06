import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTAButton, SiteFooter, SiteHeader } from "../components/marketing";
import { client } from "@/src/lib/sanity/client";
import { categoriesQuery, postsQuery } from "@/src/lib/sanity/queries";
import type { BlogCategory, BlogPost } from "@/src/lib/sanity/types";
import { urlFor } from "@/src/lib/sanity/image";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Weight Loss Blog | JourneyLite",
  description:
    "Read JourneyLite articles about bariatric surgery, gastric balloon treatment, prescription weight loss medications, pricing, and patient preparation.",
};

type BlogPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({ category: undefined }));
  const { category } = resolvedSearchParams;
  const [posts, categories] = await Promise.all([
    client.fetch<BlogPost[]>(postsQuery, {}, { next: { revalidate } }),
    client.fetch<BlogCategory[]>(categoriesQuery, {}, { next: { revalidate } }),
  ]);

  const visiblePosts = category ? posts.filter((post) => post.category?.slug === category) : posts;
  const [featuredPost, ...remainingPosts] = visiblePosts;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f7f8f6] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow">JourneyLite Blog</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">
              Weight Loss Education and Patient Resources
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#53635b]">
              Read practical guidance from JourneyLite about bariatric surgery, non-surgical weight loss procedures,
              prescription weight loss medications, pricing, preparation, and long-term support.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/contact">Book Consultation</CTAButton>
              <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                Compare Weight Loss Options
              </CTAButton>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {categories.length ? (
              <div className="mb-8 flex flex-wrap gap-2" aria-label="Blog category filters">
                <Link
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                    !category
                      ? "border-[#145c42] bg-[#145c42] text-white"
                      : "border-[#cbd7d0] bg-white text-[#17362a] hover:border-[#145c42]"
                  }`}
                  href="/blog"
                >
                  All articles
                </Link>
                {categories.map((item) =>
                  item.slug ? (
                    <Link
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                        category === item.slug
                          ? "border-[#145c42] bg-[#145c42] text-white"
                          : "border-[#cbd7d0] bg-white text-[#17362a] hover:border-[#145c42]"
                      }`}
                      href={`/blog?category=${item.slug}`}
                      key={item.slug}
                    >
                      {item.name}
                    </Link>
                  ) : null,
                )}
              </div>
            ) : null}

            {featuredPost ? (
              <article className="grid overflow-hidden rounded-2xl border border-[#dce4df] bg-[#f8fbf9] shadow-xl shadow-[#20372b]/8 lg:grid-cols-[0.95fr_1.05fr]">
                <BlogImage className="h-72 lg:h-full" post={featuredPost} priority />
                <div className="p-6 lg:p-8">
                  <p className="eyebrow">{featuredPost.category?.name ?? "Featured article"}</p>
                  <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1f2c25]">{featuredPost.title}</h2>
                  {featuredPost.excerpt ? <p className="mt-4 text-base leading-7 text-[#53635b]">{featuredPost.excerpt}</p> : null}
                  <p className="mt-5 text-sm font-semibold text-[#64736b]">{formatDate(featuredPost.publishedAt)}</p>
                  <Link
                    className="mt-6 inline-flex rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
                    href={`/blog/${featuredPost.slug}`}
                  >
                    Read article
                  </Link>
                </div>
              </article>
            ) : (
              <div className="rounded-2xl border border-[#dce4df] bg-[#f8fbf9] p-8">
                <p className="eyebrow">No posts yet</p>
                <h2 className="mt-3 text-3xl font-semibold text-[#1f2c25]">Published Sanity posts will appear here.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#53635b]">
                  Create and publish a blog post in Sanity Studio to populate the JourneyLite blog.
                </p>
                <Link
                  className="mt-6 inline-flex rounded-md border border-[#cbd7d0] bg-white px-5 py-3 text-sm font-semibold text-[#17362a] hover:border-[#145c42]"
                  href="/studio"
                >
                  Open Studio
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#edf4ef] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl">
              <p className="eyebrow">Latest posts</p>
              <h2 className="section-title">More articles from JourneyLite</h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {remainingPosts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </section>

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
              <CTAButton href="/contact">Book Consultation</CTAButton>
              <CTAButton href="/services/compare-weight-loss-options" variant="secondary">
                Compare Weight Loss Options
              </CTAButton>
              <CTAButton href="/services/pricing-financing" variant="secondary">
                Pricing & Financing
              </CTAButton>
              <CTAButton href="/contact" variant="secondary">
                Contact
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#dce4df] bg-white shadow-sm shadow-[#20372b]/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <BlogImage className="h-56" post={post} />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">
          {post.category?.name ?? "JourneyLite article"}
        </p>
        <h3 className="mt-3 text-xl font-semibold leading-tight text-[#1f2c25]">{post.title}</h3>
        {post.excerpt ? <p className="mt-3 text-sm leading-6 text-[#53635b]">{post.excerpt}</p> : null}
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#64736b]">{formatDate(post.publishedAt)}</p>
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

function BlogImage({ post, className, priority = false }: { post: BlogPost; className: string; priority?: boolean }) {
  if (!post.featuredImage) {
    return <div className={`${className} bg-[#dce8e1]`} />;
  }

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
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
