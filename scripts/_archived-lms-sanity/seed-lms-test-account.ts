#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/database.types";

const repoRoot = process.cwd();
loadEnv(path.join(repoRoot, ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.LMS_TEST_EMAIL ?? "lms-test@journeylite.local";
const providedPassword = process.env.LMS_TEST_PASSWORD;
const password = providedPassword ?? `JourneyLite-${randomBytes(9).toString("base64url")}!1`;
const courseSlugs = (process.env.LMS_TEST_COURSE_SLUGS ?? [
  "surgical-pre-op-course-dietary-module",
  "surgical-pre-op-course-medical-module",
].join(","))
  .split(",")
  .map((slug) => slug.trim())
  .filter(Boolean);

if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const user = await getOrCreateUser();

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email,
    full_name: "JourneyLite LMS Test Patient",
    role: "student",
  });
  if (profileError) throw profileError;

  const assignments = courseSlugs.map((courseSlug) => ({
    user_id: user.id,
    course_slug: courseSlug,
    status: "assigned" as const,
    due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { error: assignmentError } = await supabase
    .from("course_assignments")
    .upsert(assignments, { onConflict: "user_id,course_slug" });
  if (assignmentError) throw assignmentError;

  console.log("Seeded LMS test patient and course assignments.");
  console.log(`Email: ${email}`);
  console.log(`Password: ${providedPassword ? "(from LMS_TEST_PASSWORD)" : password}`);
  console.log(`Courses: ${courseSlugs.join(", ")}`);
}

async function getOrCreateUser() {
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "JourneyLite LMS Test Patient" },
  });
  if (error) throw error;
  return data.user;
}

async function findUserByEmail(targetEmail: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === targetEmail.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) return null;
  }
  return null;
}

function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!process.env[key]) process.env[key] = rawValue.replace(/^"|"$/g, "");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
