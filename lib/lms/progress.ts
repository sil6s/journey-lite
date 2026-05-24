import { createClient } from "@/lib/supabase/server";
import type { SanityCourse, CourseProgressSummary, LessonProgressRecord } from "@/src/lib/sanity/lms-types";

export async function getUserEnrollments(userId: string): Promise<{ course_slug: string }[]> {
  const supabase = await createClient();

  const [{ data: selfEnrolled }, { data: assigned }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("course_slug")
      .eq("user_id", userId)
      .in("status", ["active", "completed"]),
    supabase
      .from("course_assignments")
      .select("course_slug")
      .eq("user_id", userId)
      .in("status", ["assigned", "in_progress", "completed"]),
  ]);

  const seen = new Set<string>();
  const result: { course_slug: string }[] = [];
  for (const row of [...(selfEnrolled ?? []), ...(assigned ?? [])]) {
    if (!seen.has(row.course_slug)) {
      seen.add(row.course_slug);
      result.push({ course_slug: row.course_slug });
    }
  }
  return result;
}

export async function getCourseProgress(
  userId: string,
  courseSlug: string
): Promise<LessonProgressRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_course_progress")
    .select("lesson_slug, status, completed_at, last_viewed_at")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug);

  if (error) {
    console.error("[lms/progress] getCourseProgress:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    lesson_slug: row.lesson_slug,
    status: row.status,
    completed: row.status === "completed",
    completed_at: row.completed_at,
    last_viewed_at: row.last_viewed_at,
    percent_watched: row.status === "completed" ? 100 : 0,
  }));
}

export function calculateCourseProgress(
  course: SanityCourse,
  progressRows: LessonProgressRecord[]
): CourseProgressSummary {
  const allLessonSlugs = (course.modules ?? []).flatMap((m) => (m.lessons ?? []).map((l) => l.slug));
  const totalLessons = allLessonSlugs.length;
  const completedSlugs = new Set(progressRows.filter((p) => p.completed).map((p) => p.lesson_slug));
  const completedLessons = allLessonSlugs.filter((slug) => completedSlugs.has(slug)).length;
  const lastViewed = progressRows
    .filter((p) => p.last_viewed_at)
    .sort((a, b) => b.last_viewed_at.localeCompare(a.last_viewed_at))[0];

  return {
    totalLessons,
    completedLessons,
    percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    lastViewedLessonSlug: lastViewed?.lesson_slug ?? null,
    isCompleted: totalLessons > 0 && completedLessons >= totalLessons,
  };
}

export function getNextLesson(
  course: SanityCourse,
  progressRows: LessonProgressRecord[]
): { moduleSlug: string; lessonSlug: string } | null {
  const completed = new Set(progressRows.filter((p) => p.completed).map((p) => p.lesson_slug));
  for (const mod of (course.modules ?? [])) {
    for (const lesson of (mod.lessons ?? [])) {
      if (!completed.has(lesson.slug)) return { moduleSlug: mod.slug, lessonSlug: lesson.slug };
    }
  }
  return null;
}

export function getUnlockedLessonSlugs(
  course: SanityCourse,
  progressRows: LessonProgressRecord[]
): Set<string> {
  const completed = new Set(progressRows.filter((p) => p.completed).map((p) => p.lesson_slug));
  const lessons = (course.modules ?? []).flatMap((mod) => mod.lessons ?? []);
  const firstIncompleteIndex = lessons.findIndex((lesson) => !completed.has(lesson.slug));

  if (firstIncompleteIndex === -1) {
    return new Set(lessons.map((lesson) => lesson.slug));
  }

  return new Set(lessons.slice(0, firstIncompleteIndex + 1).map((lesson) => lesson.slug));
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
