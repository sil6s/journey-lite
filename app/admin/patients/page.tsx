import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchLmsCourses } from "./actions";
import { PatientsClient } from "./PatientsClient";

export const metadata = { title: "Patients — JourneyLite Admin" };
export const dynamic = "force-dynamic";

const LMS_URL = process.env.NEXT_PUBLIC_LMS_URL ?? "https://learn.journeylite.com";

function displayName(user: { user_metadata?: { full_name?: string; name?: string } | null; email?: string | null }) {
  return user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Patient";
}

export default async function PatientsAdminPage() {
  const db = getSupabaseAdminClient();

  // Same data sources the LMS's own admin dashboard reads from — both apps
  // share one Supabase project, so this is the same patients, same progress.
  const [usersRes, enrollmentsRes, progressRes, courses] = await Promise.all([
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    db.from("enrollments").select("id, user_id, course_slug, status, enrolled_at, completed_at"),
    db.from("lesson_progress").select("user_id, course_slug, completed, lesson_slug"),
    fetchLmsCourses(),
  ]);

  const users = usersRes.data?.users ?? [];
  const enrollments = enrollmentsRes.data ?? [];
  const progress = progressRes.data ?? [];

  const enrollmentsByUser: Record<string, typeof enrollments> = {};
  for (const e of enrollments) {
    if (!enrollmentsByUser[e.user_id]) enrollmentsByUser[e.user_id] = [];
    enrollmentsByUser[e.user_id].push(e);
  }

  const lessonMap: Record<string, { total: number; completed: number }> = {};
  for (const p of progress) {
    const key = `${p.user_id}::${p.course_slug}`;
    if (!lessonMap[key]) lessonMap[key] = { total: 0, completed: 0 };
    lessonMap[key].total += 1;
    if (p.completed) lessonMap[key].completed += 1;
  }

  const patients = users
    .filter((u) => u.app_metadata?.role !== "admin")
    .map((u) => {
      const userEnrollments = (enrollmentsByUser[u.id] ?? []).map((e) => {
        const key = `${u.id}::${e.course_slug}`;
        const lp = lessonMap[key] ?? { total: 0, completed: 0 };
        const pct = lp.total > 0 ? Math.round((lp.completed / lp.total) * 100) : 0;
        const course = courses.find((c) => c.slug === e.course_slug);
        return {
          id: e.id,
          courseSlug: e.course_slug,
          courseTitle: course?.title ?? e.course_slug,
          status: e.status as string,
          enrolledAt: e.enrolled_at as string,
          completedAt: e.completed_at as string | null,
          lessonsCompleted: lp.completed,
          lessonsTotal: lp.total,
          progressPct: pct,
        };
      });

      const overallPct =
        userEnrollments.length > 0
          ? Math.round(userEnrollments.reduce((sum, e) => sum + e.progressPct, 0) / userEnrollments.length)
          : 0;
      const certificateCount = userEnrollments.filter((e) => e.progressPct === 100).length;

      return {
        id: u.id,
        name: displayName(u),
        email: u.email ?? "—",
        joinedAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        status: (u.app_metadata?.deactivated ? "inactive" : "active") as "active" | "inactive",
        enrollments: userEnrollments,
        overallPct,
        certificateCount,
      };
    });

  return <PatientsClient patients={patients} courses={courses} lmsUrl={LMS_URL} />;
}
