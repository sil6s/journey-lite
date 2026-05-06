import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableTextRenderer } from "../../components/PortableTextRenderer";
import { CTAButton, SiteFooter, SiteHeader } from "../../components/marketing";
import { client } from "@/src/lib/sanity/client";
import { postBySlugQuery, postSlugsQuery } from "@/src/lib/sanity/queries";
import type { BlogPost } from "@/src/lib/sanity/types";
import { urlFor } from "@/src/lib/sanity/image";

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://journeylite.com";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await client.fetch<{ slug: string }[]>(postSlugsQuery, {}, { next: { revalidate } });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<BlogPost | null>(postBySlugQuery, { slug }, { next: { revalidate } });

  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || "Read JourneyLite weight loss education and patient resources.";
  const ogImage = post.ogImage || post.featuredImage;
  const imageUrl = ogImage ? urlFor(ogImage).width(1200).height(630).fit("crop").url() : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      url: `${siteUrl}/blog/${post.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: post.featuredImageAlt || post.title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await client.fetch<BlogPost | null>(postBySlugQuery, { slug }, { next: { revalidate } });

  if (!post) notFound();

  const toc = getTableOfContents(post.body ?? []);
  const relatedServices = post.relatedServices ?? [];
  const featuredImageUrl = post.featuredImage ? urlFor(post.featuredImage).width(1400).height(760).fit("crop").url() : null;

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    image: featuredImageUrl ? [featuredImageUrl] : undefined,
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.title,
        }
      : {
          "@type": "Organization",
          name: "JourneyLite Physicians",
        },
    publisher: {
      "@type": "Organization",
      name: "JourneyLite Physicians",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/journeylite-logo.svg`,
      },
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main>
        <article>
          <header className="bg-[#f7f8f6] py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <div className="max-w-4xl">
                <p className="eyebrow">{post.category?.name ?? "JourneyLite Blog"}</p>
                <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-[#1e2b24] md:text-6xl">{post.title}</h1>
                {post.excerpt ? <p className="mt-6 text-lg leading-8 text-[#53635b]">{post.excerpt}</p> : null}
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[#64736b]">
                  <span>{formatDate(post.publishedAt)}</span>
                  {post.author?.name ? <span>By {post.author.name}</span> : null}
                </div>
              </div>
            </div>
          </header>

          {featuredImageUrl ? (
            <div className="bg-white">
              <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                <Image
                  alt={post.featuredImageAlt || post.title}
                  className="max-h-[620px] w-full rounded-2xl border border-[#dce4df] object-cover shadow-xl shadow-[#20372b]/8"
                  height={760}
                  priority
                  src={featuredImageUrl}
                  width={1400}
                />
              </div>
            </div>
          ) : null}

          <section className="bg-white py-12 lg:py-16">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[260px_1fr] lg:px-8">
              <aside className="lg:sticky lg:top-28 lg:self-start">
                {toc.length ? (
                  <nav className="rounded-xl border border-[#dce4df] bg-[#f8fbf9] p-5" aria-label="Table of contents">
                    <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#355346]">In this article</p>
                    <ol className="mt-4 space-y-2 text-sm leading-6">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a className="text-[#53635b] underline-offset-4 hover:text-[#145c42] hover:underline" href={`#${item.id}`}>
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                ) : null}
              </aside>

              <div className="max-w-3xl">
                {post.body?.length ? <PortableTextRenderer value={post.body} /> : null}

                <aside className="mt-12 rounded-xl border border-[#d8c88b] bg-[#fffdf4] p-5 text-sm leading-6 text-[#5e5235]">
                  <p className="font-semibold text-[#1f2c25]">Medical disclaimer</p>
                  <p className="mt-2">
                    This article is for educational purposes only and does not replace medical advice. Treatment
                    recommendations depend on your health history, BMI, goals, and provider evaluation.
                  </p>
                </aside>

                {relatedServices.length ? (
                  <section className="mt-12 rounded-2xl border border-[#dce4df] bg-[#edf4ef] p-6">
                    <p className="eyebrow">Related JourneyLite services</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {relatedServices.map((href) => (
                        <Link
                          className="rounded-lg border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] hover:text-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
                          href={href}
                          key={href}
                        >
                          {labelForService(href)}
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </section>
        </article>

        {post.relatedPosts?.length ? (
          <section className="bg-[#edf4ef] py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <div className="max-w-3xl">
                <p className="eyebrow">Related posts</p>
                <h2 className="section-title">More from JourneyLite</h2>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {post.relatedPosts.map((related) => (
                  <Link
                    className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#145c42]"
                    href={`/blog/${related.slug}`}
                    key={related._id}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#145c42]">
                      {related.category?.name ?? "JourneyLite article"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-tight text-[#1f2c25]">{related.title}</h3>
                    {related.excerpt ? <p className="mt-3 text-sm leading-6 text-[#53635b]">{related.excerpt}</p> : null}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-[#0f3e2e] py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="eyebrow text-[#b9d2c5]">Personalized next step</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              Ready to talk with JourneyLite?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8e6de]">
              Schedule a consultation to compare surgical, non-surgical, and medication-supported options with a care
              team that can review your goals and health history.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CTAButton href="/contact" variant="light">
                Book Consultation
              </CTAButton>
              <CTAButton href="/services/compare-weight-loss-options" variant="outline">
                Compare Options
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

function getTableOfContents(body: BlogPost["body"]) {
  if (!body) return [];
  return body
    .filter((block) => block._type === "block" && "style" in block && block.style === "h2")
    .map((block) => {
      const text =
        "children" in block && Array.isArray(block.children)
          ? block.children.map((child) => ("text" in child ? child.text : "")).join("")
          : "";
      return {
        text,
        id: slugify(text),
      };
    })
    .filter((item) => item.text);
}

function labelForService(href: string) {
  const labels: Record<string, string> = {
    "/services/gastric-sleeve": "Gastric Sleeve",
    "/services/gastric-bypass": "Gastric Bypass",
    "/services/gastric-balloon": "Gastric Balloon",
    "/medications": "Medication Weight Loss",
    "/services/pricing-financing": "Pricing & Financing",
    "/services/compare-weight-loss-options": "Compare Options",
    "/contact": "Contact JourneyLite",
  };
  return labels[href] ?? "Learn more";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(date?: string) {
  if (!date) return "Date pending";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
