import { BlogEditor } from "@/components/admin/blog-editor";
import { getAdminContentData } from "@/lib/admin/content";

export const metadata = { title: "New Blog Post — JourneyLite Admin" };

export default async function NewBlogPostPage() {
  const { categories, authors } = await getAdminContentData();

  return (
    <BlogEditor
      mode="new"
      categories={categories.map((c) => ({ _id: c._id, name: c.name ?? "" }))}
      authors={authors.map((a) => ({ _id: a._id, name: a.name }))}
    />
  );
}
