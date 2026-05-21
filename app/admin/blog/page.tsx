import { BlogAdminTable } from "@/components/admin/blog-admin-table";
import { SeoHelperPanel } from "@/components/admin/seo-helper-panel";
import { getAdminContentData } from "@/lib/admin/content";

export default async function AdminBlogPage() {
  const data = await getAdminContentData();
  const latestPost = data.posts[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <BlogAdminTable posts={data.posts} categories={data.categories} authors={data.authors} />
      <SeoHelperPanel
        focusKeyword={latestPost?.seoTitle}
        metaTitle={latestPost?.seoTitle}
        metaDescription={latestPost?.seoDescription}
        slug={latestPost?.slug}
        excerpt={latestPost?.excerpt}
        internalLinks={latestPost?.relatedServices?.length ?? 0}
        externalLinks={0}
        imageAlt={latestPost?.featuredImageAlt}
        wordCount={latestPost?.bodyText?.split(/\s+/).filter(Boolean).length ?? 0}
      />
    </div>
  );
}
