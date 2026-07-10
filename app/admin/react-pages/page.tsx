import { ReactPagesManager } from "@/components/admin/react-pages-manager";
import { fetchReactPageOverrides } from "./actions";

export const metadata = { title: "React Pages — JourneyLite Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReactPagesPage() {
  const pages = await fetchReactPageOverrides().catch(() => []);
  return <ReactPagesManager initialPages={pages} />;
}
