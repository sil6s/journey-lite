"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminClient } from "@/src/lib/sanity/client";
import { revalidatePath } from "next/cache";

export type LmsCourse = {
  slug: string;
  title: string;
  description?: string;
  moduleCount?: number;
};

/** Fetch all published LMS courses from Sanity (shared project) */
export async function fetchLmsCourses(): Promise<LmsCourse[]> {
  try {
    return await adminClient.fetch<LmsCourse[]>(
      `*[_type == "lmsCourse" && isPublished == true] | order(_createdAt asc) {
        "slug": slug.current,
        title,
        description,
        "moduleCount": count(modules)
      }`
    );
  } catch {
    return [];
  }
}

/** Assign (replace) a user's enrollments with the given course slugs */
export async function assignCoursesAction(userId: string, courseSlugs: string[]): Promise<void> {
  const db = getSupabaseAdminClient();

  // Get all currently assignable slugs (to avoid touching other sources)
  const courses = await fetchLmsCourses();
  const assignable = new Set(courses.map((c) => c.slug));

  // Delete existing enrollments for assignable courses only
  await db.from("enrollments").delete().eq("user_id", userId).in("course_slug", Array.from(assignable));

  // Upsert new enrollments
  if (courseSlugs.length > 0) {
    const rows = courseSlugs
      .filter((s) => assignable.has(s))
      .map((course_slug) => ({
        user_id: userId,
        course_slug,
        status: "active",
        enrolled_at: new Date().toISOString(),
      }));
    if (rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await db.from("enrollments").upsert(rows as any[], { onConflict: "user_id,course_slug", ignoreDuplicates: true });
      if (error) throw error;
    }
  }

  revalidatePath("/admin/patients");
}

/** Reset all lesson progress for a user */
export async function resetProgressAction(userId: string): Promise<void> {
  const db = getSupabaseAdminClient();
  await db.from("lesson_progress").delete().eq("user_id", userId);
  revalidatePath("/admin/patients");
}
