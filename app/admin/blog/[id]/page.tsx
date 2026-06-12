import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/admin/blog-editor";
import { getAdminContentData } from "@/lib/admin/content";
import { getBlogPostById } from "@/lib/admin/blog-actions";

export const metadata = { title: "Edit Blog Post — JourneyLite Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const [post, { categories, authors }] = await Promise.all([
    getBlogPostById(id),
    getAdminContentData(),
  ]);

  if (!post) notFound();

  return (
    <BlogEditor
      mode="edit"
      postId={post._id}
      initialTitle={post.title}
      initialSlug={post.slug?.current ?? ""}
      initialExcerpt={post.excerpt ?? ""}
      initialHtmlBody={post.htmlBody ?? ""}
      initialPublishedAt={post.publishedAt}
      initialSeoTitle={post.seoTitle ?? ""}
      initialSeoDescription={post.seoDescription ?? ""}
      initialTags={post.tags ?? []}
      initialFeaturedImageAlt={post.featuredImageAlt ?? ""}
      initialCategoryId={post.category?._id ?? ""}
      initialAuthorId={post.author?._id ?? ""}
      categories={categories.map((c) => ({ _id: c._id, name: c.name ?? "" }))}
      authors={authors.map((a) => ({ _id: a._id, name: a.name }))}
    />
  );
}
