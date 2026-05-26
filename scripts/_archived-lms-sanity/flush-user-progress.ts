#!/usr/bin/env tsx
/**
 * flush-user-progress.ts
 *
 * Wipes all LMS progress for a single user and resets their course assignments
 * back to "assigned" so they can restart from lesson 1.
 *
 * Usage:
 *   npx tsx scripts/flush-user-progress.ts silas.curry1@gmail.com
 *   npx tsx scripts/flush-user-progress.ts  # defaults to FLUSH_USER_EMAIL env var
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const repoRoot = process.cwd();
loadEnv(path.join(repoRoot, ".env.local"));

const email = process.argv[2] ?? process.env.FLUSH_USER_EMAIL;
if (!email) throw new Error("Pass the user email as first argument or set FLUSH_USER_EMAIL");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL missing");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🔍  Looking up user: ${email}`);
  const user = await findUserByEmail(email);
  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    process.exit(1);
  }
  const userId = user.id;
  console.log(`   Found user ID: ${userId}\n`);

  // Use the reset_user_progress RPC (SECURITY DEFINER, runs as postgres, handles all tables)
  // Requires migration 0003_service_role_grants_reset_rpc.sql to be applied.
  const { error: rpcError } = await supabase.rpc("reset_user_progress", { p_user_id: userId });

  if (rpcError) {
    // Fallback: RPC not yet deployed — warn but don't crash
    if (rpcError.code === "42883") {
      console.warn("   ⚠️  reset_user_progress RPC not found.");
      console.warn("       Apply supabase/migrations/0003_service_role_grants_reset_rpc.sql");
      console.warn("       via the Supabase Dashboard → SQL Editor, then re-run this script.");
      process.exit(1);
    }
    throw new Error(`reset_user_progress RPC failed: ${rpcError.message}`);
  }

  console.log(`   ✓  All progress tables wiped (user_course_progress, user_lesson_events,`);
  console.log(`      user_quiz_attempts, completion_attestations, lesson_progress)`);
  console.log(`   ✓  course_assignments reset → assigned`);
  console.log(`   ✓  enrollments reset → active`);

  console.log(`\n✅  Progress flushed for ${email}. They can now start all courses from lesson 1.\n`);
}

async function findUserByEmail(targetEmail: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (match) return match;
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
