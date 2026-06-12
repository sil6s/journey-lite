import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PatientsClient } from "./PatientsClient";

export const metadata = { title: "Patients — JourneyLite Admin" };
export const revalidate = 60;

const LMS_URL = process.env.NEXT_PUBLIC_LMS_URL ?? "https://learn.journeylite.com";

export default async function PatientsAdminPage() {
  const db = getSupabaseAdminClient();

  // Pull all patient profiles + their enrollments + lesson progress counts in parallel
  const [profilesRes, enrollmentsRes, progressRes] = await Promise.all([
    db
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false }),

    db
      .from("enrollments")
      .select("id, user_id, course_slug, status, enrolled_at, completed_at"),

    db
      .from("lesson_progress")
      .select("user_id, course_slug, completed, lesson_slug"),
  ]);

  const profiles = profilesRes.data ?? [];
  const enrollments = enrollmentsRes.data ?? [];
  const progress = progressRes.data ?? [];

  // Build per-user enrollment summary
  const enrollmentsByUser: Record<string, typeof enrollments> = {};
  for (const e of enrollments) {
    if (!enrollmentsByUser[e.user_id]) enrollmentsByUser[e.user_id] = [];
    enrollmentsByUser[e.user_id].push(e);
  }

  // Build per-(user,course) lesson counts
  const lessonMap: Record<string, { total: number; completed: number }> = {};
  for (const p of progress) {
    const key = `${p.user_id}::${p.course_slug}`;
    if (!lessonMap[key]) lessonMap[key] = { total: 0, completed: 0 };
    lessonMap[key].total += 1;
    if (p.completed) lessonMap[key].completed += 1;
  }

  // Shape the data for the client component
  const patients = profiles
    .filter((p) => p.role === "student" || enrollmentsByUser[p.id]?.length)
    .map((p) => {
      const userEnrollments = (enrollmentsByUser[p.id] ?? []).map((e) => {
        const key = `${p.id}::${e.course_slug}`;
        const lp = lessonMap[key] ?? { total: 0, completed: 0 };
        const pct = lp.total > 0 ? Math.round((lp.completed / lp.total) * 100) : 0;
        return {
          id: e.id,
          courseSlug: e.course_slug,
          status: e.status,
          enrolledAt: e.enrolled_at,
          completedAt: e.completed_at,
          lessonsCompleted: lp.completed,
          lessonsTotal: lp.total,
          progressPct: pct,
        };
      });

      const overallPct =
        userEnrollments.length > 0
          ? Math.round(userEnrollments.reduce((sum, e) => sum + e.progressPct, 0) / userEnrollments.length)
          : 0;

      return {
        id: p.id,
        name: p.full_name ?? "—",
        email: p.email ?? "—",
        joinedAt: p.created_at,
        enrollments: userEnrollments,
        overallPct,
      };
    });

  return <PatientsClient patients={patients} lmsUrl={LMS_URL} />;
}
