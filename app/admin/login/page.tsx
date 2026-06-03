"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useState } from "react";
import { ArrowLeft, Loader2, MailCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/site/TurnstileWidget";
import { createClient } from "@/lib/supabase/client";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const displayedError = error ?? searchParams.get("error");

  const nextPath = safeAdminNext(searchParams.get("next"));

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    if (token) setTurnstileError("");
  }, []);

  const handleTurnstileReset = useCallback(() => {
    setTurnstileToken("");
    setTurnstileError("Security check failed. Refresh the page and try again.");
  }, []);

  async function startGoogleLogin() {
    setError(null);
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
        queryParams: {
          // Force account selection every time so staff can switch accounts.
          prompt: "select_account",
        },
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setIsGoogleLoading(false);
    }
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsMagicLinkSent(false);

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsEmailLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
          shouldCreateUser: true,
          captchaToken: turnstileToken || undefined,
        },
      });

      if (signInError) throw signInError;
      setIsMagicLinkSent(true);
      toast.success("Magic link sent. Check your email to continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the magic link.");
    } finally {
      setIsEmailLoading(false);
      setTurnstileToken("");
      setTurnstileResetKey((current) => current + 1);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf7] text-[#173c2b]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(#9ac5a9 2px, transparent 2px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative grid min-h-screen w-full bg-white lg:grid-cols-[0.82fr_1fr]">
        <section className="hidden bg-[#153f2b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-[#0f3322] text-2xl font-bold text-white shadow-inner">
                JL
              </div>
              <div>
                <p className="text-2xl font-semibold">JourneyLite</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.24em] text-[#8fd09d]">Admin Portal</p>
              </div>
            </div>
            <h1 className="mt-24 max-w-md text-6xl font-semibold leading-tight tracking-tight text-[#f8f4e9]">
              Welcome back, staff.
            </h1>
            <p className="mt-8 max-w-md text-2xl leading-relaxed text-[#9fd4aa]">
              Securely manage patient journeys, locations, and content across Ohio, Kentucky, and Indiana.
            </p>
          </div>
          <div className="space-y-6 border-t border-white/15 pt-8">
            <StatRow value="6,000+" label="Gastric sleeves" />
            <StatRow value="5" label="Regional locations" />
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-24">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#153f2b] text-base font-bold text-white">
                JL
              </div>
              <div>
                <p className="text-lg font-semibold">JourneyLite</p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Admin Portal</p>
              </div>
            </div>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Sign in</h2>
            <p className="mt-5 text-xl text-[#728178]">Access the JourneyLite admin dashboard</p>

            {displayedError ? (
              <Alert className="mt-8" variant="destructive">
                <AlertDescription>{displayedError}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              className="mt-10 h-16 w-full rounded-xl border-[#dbe2dd] bg-white text-lg font-semibold text-[#173c2b] shadow-sm hover:bg-[#f7faf7]"
              disabled={isGoogleLoading || isEmailLoading}
              onClick={startGoogleLogin}
              type="button"
              variant="outline"
            >
              {isGoogleLoading ? <Loader2 className="animate-spin" /> : <GoogleMark />}
              Continue with Google
            </Button>

            <div className="my-10 grid grid-cols-[1fr_auto_1fr] items-center gap-5 text-sm font-medium text-[#9aaaa0]">
              <span className="h-px bg-[#dde5df]" />
              <span>or use a magic link / OTP</span>
              <span className="h-px bg-[#dde5df]" />
            </div>

            <form className="space-y-7" onSubmit={sendMagicLink}>
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-[#2d4b39]" htmlFor="email">
                  Email
                </Label>
                <Input
                  className="h-16 rounded-xl border-[#dbe2dd] px-6 text-lg text-[#173c2b]"
                  id="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@journeylite.com"
                  required
                />
              </div>

              {isMagicLinkSent ? (
                <Alert className="border-[#b9d8c4] bg-[#f0f8f2] text-[#173c2b]">
                  <MailCheck className="size-5" />
                  <AlertDescription>
                    Check your email for a one-time sign-in link. It will bring you back to the admin portal.
                  </AlertDescription>
                </Alert>
              ) : null}

              {TURNSTILE_SITE_KEY ? (
                <TurnstileWidget
                  key={turnstileResetKey}
                  action="admin-login"
                  onError={handleTurnstileReset}
                  onExpire={handleTurnstileReset}
                  onVerify={handleTurnstileVerify}
                />
              ) : null}
              {turnstileError ? <p className="text-sm font-semibold text-[#8a3b22]">{turnstileError}</p> : null}

              <Button
                className="h-16 w-full rounded-xl !bg-[#153f2b] text-lg font-semibold !text-white hover:!bg-[#0f3322]"
                disabled={isGoogleLoading || isEmailLoading || Boolean(TURNSTILE_SITE_KEY && !turnstileToken)}
                type="submit"
              >
                {isEmailLoading ? <Loader2 className="animate-spin" /> : <Send />}
                Send magic link
              </Button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              Email sign-in uses Supabase OTP, delivered as a magic link or one-time code. Only approved admin emails can access the dashboard after sign-in.
            </p>

            <Link className="mt-6 inline-flex items-center gap-2 text-lg font-medium text-[#96a89c] hover:text-[#153f2b]" href="/">
              <ArrowLeft className="size-4" />
              Return to public site
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function safeAdminNext(path: string | null) {
  return path?.startsWith("/admin") ? path : "/admin";
}

function AdminLoginFallback() {
  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-sm">
          <div className="h-10 w-40 rounded bg-[#edf4ef]" />
          <div className="mt-6 h-14 rounded-xl bg-[#edf4ef]" />
          <div className="mt-4 h-14 rounded-xl bg-[#edf4ef]" />
          <div className="mt-8 h-16 rounded-xl bg-[#d7e7df]" />
        </div>
      </div>
    </main>
  );
}

function StatRow({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center border-b border-white/15 pb-6 last:border-0">
      <span className="text-4xl font-semibold text-[#e9f4ed]">{value}</span>
      <span className="text-xl text-[#85b891]">{label}</span>
    </div>
  );
}

function GoogleMark() {
  return (
    <Image alt="" aria-hidden="true" className="size-7" height={64} src="/google-favicon.webp" width={64} />
  );
}
