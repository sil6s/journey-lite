import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/app/components/marketing";
import { SitePageRenderer } from "@/components/site-pages/site-page-renderer";
import { client } from "@/src/lib/sanity/client";
import { sitePageBySlugQuery, sitePageSlugsQuery } from "@/src/lib/sanity/queries";
import type { SitePage } from "@/src/lib/sanity/types";
import { urlFor } from "@/src/lib/sanity/image";

export const revalidate = 30;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://journeylite.com";

type SitePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const pages = await client.fetch<{ slug: string }[]>(sitePageSlugsQuery, {}, { next: { revalidate } });
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await client.fetch<SitePage | null>(sitePageBySlugQuery, { slug }, { next: { revalidate } });
  if (!page) return {};

  const title = page.seoTitle || page.heroHeadline || page.title;
  const description = page.seoDescription || page.heroSubheadline || "JourneyLite weight loss care and patient resources.";
  const image = page.ogImage || page.heroImage;
  const imageUrl = image ? urlFor(image).width(1200).height(630).fit("crop").url() : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/${page.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: page.heroImageAlt || page.title }] : undefined,
    },
  };
}

export default async function DynamicSitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const page = await client.fetch<SitePage | null>(sitePageBySlugQuery, { slug }, { next: { revalidate } });
  if (!page) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <SitePageRenderer page={page} />
      </main>
      <SiteFooter />
    </>
  );
}
