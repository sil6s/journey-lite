import { ContentClient } from "./ContentClient";
import { fetchAllContent, fetchFormDefinitions } from "./actions";
import { getAdminContentData } from "@/lib/admin/content";

export const metadata = { title: "Content — JourneyLite Admin" };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [{ posts, pages }, { categories, authors }, forms] = await Promise.all([
    fetchAllContent(),
    getAdminContentData(),
    fetchFormDefinitions().catch(() => []),
  ]);

  return (
    <ContentClient
      initialPosts={posts}
      initialPages={pages}
      categories={categories.map((c) => ({ _id: c._id, name: c.name ?? "" }))}
      authors={authors.map((a) => ({ _id: a._id, name: a.name ?? "" }))}
      forms={forms}
    />
  );
}
