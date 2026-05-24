import { createClient } from "@/lib/supabase/server";
import type { AccessType } from "@/src/lib/sanity/lms-types";

export type AccessResult =
  | { allowed: true }
  | { allowed: false; reason: "unauthenticated" | "not-enrolled" | "expired" | "revoked" };

export async function checkCourseAccess(
  userId: string | null,
  courseSlug: string,
  accessType: AccessType
): Promise<AccessResult> {
  if (!userId) return { allowed: false, reason: "unauthenticated" };
  if (accessType === "free") return { allowed: true };

  const supabase = await createClient();

  // Check self-enrollment first
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (enrollment) {
    if (enrollment.status === "revoked") return { allowed: false, reason: "revoked" };
    if (enrollment.status === "expired") return { allowed: false, reason: "expired" };
    return { allowed: true };
  }

  // Fall back to admin-assigned courses
  const { data: assignment } = await supabase
    .from("course_assignments")
    .select("status, due_at")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (assignment) {
    if (assignment.status === "revoked") return { allowed: false, reason: "revoked" };
    if (assignment.due_at && new Date(assignment.due_at) < new Date() && assignment.status !== "completed") {
      return { allowed: false, reason: "expired" };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: "not-enrolled" };
}

export async function checkLessonAccess(
  userId: string | null,
  courseSlug: string,
  accessType: AccessType,
  isPreview: boolean
): Promise<AccessResult> {
  if (isPreview) return { allowed: true };
  return checkCourseAccess(userId, courseSlug, accessType);
}
