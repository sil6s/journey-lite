#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
function loadEnv(f: string) {
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
loadEnv(path.join(process.cwd(), ".env.local"));
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 100 });
for (const u of data.users) console.log(u.email, "|", u.id);
