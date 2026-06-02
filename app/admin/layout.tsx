import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminSessionCookieName, verifyAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "JourneyLite Admin",
  description: "Manage JourneyLite website content and performance.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await verifyAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  return <AdminShell user={session ? { email: session.email, name: session.name, picture: session.picture, role: session.role } : null}>{children}</AdminShell>;
}
