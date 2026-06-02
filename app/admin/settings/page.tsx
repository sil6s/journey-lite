import Link from "next/link";
import { CheckCircle2, CircleAlert, KeyRound, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  const recaptchaServerConfigured = Boolean(process.env.RECAPTCHA_ENTERPRISE_API_KEY && process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID);
  const recaptchaRequired = process.env.RECAPTCHA_ENFORCEMENT === "required";
  const checks = [
    { label: "Sanity project", ok: Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID), detail: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "Missing" },
    { label: "Sanity dataset", ok: Boolean(process.env.NEXT_PUBLIC_SANITY_DATASET), detail: process.env.NEXT_PUBLIC_SANITY_DATASET || "Missing" },
    { label: "Sanity write token", ok: Boolean(process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN), detail: "Server-side only" },
    { label: "Google OAuth", ok: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET), detail: "Admin sign-in" },
    { label: "Admin access table", ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY), detail: "Managed in Supabase" },
    { label: "Umami tracking", ok: Boolean(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID), detail: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "Missing" },
    { label: "reCAPTCHA public key", ok: Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY), detail: "Enterprise script" },
    {
      label: "reCAPTCHA server verification",
      ok: recaptchaServerConfigured || !recaptchaRequired,
      detail: recaptchaServerConfigured
        ? "Enterprise verification enabled"
        : recaptchaRequired
          ? "Required but missing"
          : "Optional bypass until Enterprise API key and project ID are added",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Admin configuration status. Sensitive values stay in environment variables and are never shown here.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Integration status
            </CardTitle>
            <CardDescription>What the admin portal needs to run safely.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {checks.map((check) => (
              <div className="flex items-center justify-between gap-4 py-4" key={check.label}>
                <div>
                  <p className="font-medium">{check.label}</p>
                  <p className="text-sm text-muted-foreground">{check.detail}</p>
                </div>
                <Badge variant={check.ok ? "default" : "secondary"}>{check.ok ? "Configured" : "Needs setup"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-5" />
                Access control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <StatusLine ok={Boolean(process.env.ADMIN_AUTH_SECRET)} label="Signed admin session cookies" />
              <StatusLine ok={Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)} label="Supabase admin role table" />
              <StatusLine ok={Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID)} label="Google OAuth client" />
              <Separator />
              <p className="text-muted-foreground">
                Superadmins can add, downgrade, or disable admins in <Link className="font-medium text-primary underline underline-offset-4" href="/admin/admins">Admin Management</Link>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Umami is the primary analytics provider.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Tracking script: cloud.umami.is</p>
              <p>Live charts require a server-side Umami API key or share URL.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="size-4 text-emerald-600" /> : <CircleAlert className="size-4 text-amber-600" />}
      <span>{label}</span>
    </div>
  );
}
