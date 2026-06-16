"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminClient } from "@/src/lib/sanity/client";
import { sendPatientInviteEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const LMS_URL = process.env.NEXT_PUBLIC_LMS_URL ?? "https://learn.journeylite.com";

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
        "moduleCount": count(sections)
      }`
    );
  } catch {
    return [];
  }
}

async function findAuthUserByEmail(email: string) {
  const db = getSupabaseAdminClient();
  const normalized = email.toLowerCase();
  let page = 1;
  while (page < 20) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match;
    if (data.users.length < 1000) return null;
    page += 1;
  }
  return null;
}

/** Invite a new patient to the LMS (or re-enroll an existing one) — same flow as the LMS's own admin dashboard. */
export async function inviteUserAction(data: {
  email: string;
  fullName?: string;
  courseSlugs: string[];
}): Promise<void> {
  const email = data.email.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Enter a valid email address.");

  const db = getSupabaseAdminClient();
  const courses = await fetchLmsCourses();
  const assignable = new Set(courses.map((c) => c.slug));
  const courseSlugs = data.courseSlugs.filter((s) => assignable.has(s));
  const courseTitles = courseSlugs.map((s) => courses.find((c) => c.slug === s)?.title ?? s);
  const fullName = data.fullName?.trim() || "";

  let targetUserId: string;
  let inviteHref = `${LMS_URL}/login`;

  const existingUser = await findAuthUserByEmail(email);
  if (existingUser) {
    targetUserId = existingUser.id;
    if (fullName) {
      await db.auth.admin.updateUserById(existingUser.id, {
        user_metadata: { ...existingUser.user_metadata, full_name: fullName },
      });
    }
  } else {
    const { data: linkData, error } = await db.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: `${LMS_URL}/api/auth/callback?next=/dashboard`,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    if (error) throw error;
    if (!linkData.user) throw new Error("Failed to create the patient account.");
    targetUserId = linkData.user.id;
    inviteHref = linkData.properties?.action_link ?? inviteHref;
  }

  if (courseSlugs.length > 0) {
    const rows = courseSlugs.map((course_slug) => ({
      user_id: targetUserId,
      course_slug,
      status: "active",
      enrolled_at: new Date().toISOString(),
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await db.from("enrollments").upsert(rows as any[], { onConflict: "user_id,course_slug" });
    if (error) throw error;
  }

  await sendPatientInviteEmail({
    to: email,
    name: fullName || email,
    inviteHref,
    courseTitles,
  });

  revalidatePath("/admin/patients");
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
