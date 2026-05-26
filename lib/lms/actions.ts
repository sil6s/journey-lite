"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export type CompletionRequirement = "view_content" | "complete_interaction" | "pass_knowledge_check";

export async function enrollInCourse(courseSlug: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in to enroll." };

    const { data: existing, error: lookupError } = await supabase
      .from("enrollments")
      .select("status")
      .eq("user_id", user.id)
      .eq("course_slug", courseSlug)
      .maybeSingle();

    if (lookupError) {
      console.error("[lms/actions] enrollInCourse lookup:", lookupError.code, lookupError.message);
      return { error: "Could not enroll. Please try again." };
    }

    if (existing?.status === "revoked") {
      return { error: "Access to this course is not available. Please contact the JourneyLite team." };
    }

    if (existing) {
      if (existing.status !== "active") {
        const { error } = await supabase
          .from("enrollments")
          .update({ status: "active", completed_at: null })
          .eq("user_id", user.id)
          .eq("course_slug", courseSlug);

        if (error) {
          console.error("[lms/actions] enrollInCourse update:", error.code, error.message);
          return { error: "Could not enroll. Please try again." };
        }
      }

      revalidatePath(`/courses/${courseSlug}`);
      revalidatePath("/dashboard");
      return {};
    }

    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: user.id, course_slug: courseSlug, status: "active" });

    if (error && error.code !== "23505") {
      console.error("[lms/actions] enrollInCourse:", error.code, error.message);
      return { error: "Could not enroll. Please try again." };
    }

    revalidatePath(`/courses/${courseSlug}`);
    revalidatePath("/dashboard");
    return {};
  } catch (e) {
    console.error("[lms/actions] enrollInCourse unexpected:", e);
    return { error: "Unexpected error. Please try again." };
  }
}

export async function updateLastViewed(
  courseSlug: string,
  sectionTitle: string | null,
  lessonSlug: string
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date().toISOString();
  await supabase.from("user_course_progress").upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      section_title: sectionTitle,
      lesson_slug: lessonSlug,
      status: "in_progress",
      last_viewed_at: now,
    },
    { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false }
  );

  await supabase.from("user_lesson_events").insert({
    user_id: user.id,
    course_slug: courseSlug,
    lesson_slug: lessonSlug,
    event: "lesson_viewed",
  });

  await supabase
    .from("course_assignments")
    .update({ status: "in_progress" })
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .eq("status", "assigned");
}

export async function recordLessonInteraction(
  courseSlug: string,
  lessonSlug: string,
  event: string,
  metadata: Json = {}
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("user_lesson_events").insert({
    user_id: user.id,
    course_slug: courseSlug,
    lesson_slug: lessonSlug,
    event,
    metadata,
  });
}

export async function submitQuizAttempt(
  courseSlug: string,
  lessonSlug: string,
  answers: Record<string, number>,
  answerKey: Record<string, number>,
  passingScore = 100
): Promise<{ score: number; passed: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const total = Object.keys(answerKey).length;
  const correct = Object.entries(answerKey).filter(([id, index]) => answers[id] === index).length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 100;
  const passed = score >= passingScore;
  const now = new Date().toISOString();

  await supabase.from("user_quiz_attempts").insert({
    user_id: user.id,
    course_slug: courseSlug,
    lesson_slug: lessonSlug,
    score,
    passed,
    answers,
    submitted_at: now,
  });

  if (passed) {
    await recordLessonInteraction(courseSlug, lessonSlug, "knowledge_check_passed", { score });
  }

  return { score, passed };
}

export async function markLessonComplete(
  courseSlug: string,
  sectionTitle: string | null,
  lessonSlug: string,
  completed: boolean,
  requirements: CompletionRequirement[] = []
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (completed) {
    const { data: events } = await supabase
      .from("user_lesson_events")
      .select("event")
      .eq("user_id", user.id)
      .eq("course_slug", courseSlug)
      .eq("lesson_slug", lessonSlug);

    const eventNames = new Set((events ?? []).map((event) => event.event));
    if (requirements.includes("complete_interaction") && !eventNames.has("interaction_completed")) {
      throw new Error("Complete the lesson activity before marking this lesson complete.");
    }
    if (requirements.includes("pass_knowledge_check") && !eventNames.has("knowledge_check_passed")) {
      throw new Error("Pass the knowledge check before marking this lesson complete.");
    }
  }

  const now = new Date().toISOString();
  await supabase.from("user_course_progress").upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      section_title: sectionTitle,
      lesson_slug: lessonSlug,
      status: completed ? "completed" : "in_progress",
      completed_at: completed ? now : null,
      last_viewed_at: now,
    },
    { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false }
  );

  await supabase.from("user_lesson_events").insert({
    user_id: user.id,
    course_slug: courseSlug,
    lesson_slug: lessonSlug,
    event: completed ? "lesson_completed" : "lesson_reopened",
  });

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard");
}

export async function completeCourseEnrollment(
  courseSlug: string,
  totalLessons: number,
  completedLessons: number
): Promise<void> {
  if (completedLessons < totalLessons) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("course_assignments")
    .update({ status: "completed" })
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug);

  await supabase
    .from("enrollments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .neq("status", "revoked");
}

export async function resetMyProgress(): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in to reset your progress." };

    const { error } = await supabase.rpc("reset_user_progress", { p_user_id: user.id });
    if (error) {
      console.error("[lms/actions] resetMyProgress:", error.code, error.message);
      return { error: "Could not reset progress. Please try again or contact support." };
    }

    revalidatePath("/courses");
    revalidatePath("/dashboard");
    return {};
  } catch (e) {
    console.error("[lms/actions] resetMyProgress unexpected:", e);
    return { error: "Unexpected error. Please try again." };
  }
}

export async function submitCompletionAttestation(courseSlug: string, metadata: Json = {}): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const userAgent = requestHeaders.get("user-agent");
  const ipHash = createHash("sha256").update(ip).digest("hex");

  await supabase.from("completion_attestations").insert({
    user_id: user.id,
    course_slug: courseSlug,
    ip_hash: ipHash,
    user_agent: userAgent,
    metadata,
  });
}
