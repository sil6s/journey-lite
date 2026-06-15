import { fetchStaff } from "@/app/admin/people/actions";
import { StaffClient } from "./StaffClient";

export const metadata = { title: "Staff / Providers — JourneyLite Admin" };
export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const staff = await fetchStaff().catch(() => []);
  return <StaffClient initialStaff={staff} />;
}
