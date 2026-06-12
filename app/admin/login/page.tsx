"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useState } from "react";
import { AlertCircle, ArrowLeft, KeyRound, Loader2, Mail, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TurnstileWidget } from "@/components/site/TurnstileWidget";

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
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
    setTurnstileError("Security check failed. Please refresh and try again.");
  }, []);

  async function sendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          captchaToken: turnstileToken || undefined,
        },
      });

      if (signInError) throw signInError;
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the sign-in code. Please try again.");
    } finally {
      setIsLoading(false);
      setTurnstileToken("");
      setTurnstileResetKey((k) => k + 1);
    }
  }

  async function verifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanCode = code.replace(/\D/g, "");
    if (cleanCode.length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setIsVerifying(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanCode,
        type: "email",
      });

      if (verifyError) throw verifyError;
      window.location.href = nextPath;
    } catch {
      setError("That code didn't work. Check your email and try again, or request a new code.");
      setIsVerifying(false);
    }
  }

  async function resendCode() {
    setCode("");
    setError(null);
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });
    } catch {
      // Non-fatal — user can try again
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf7] text-[#1f2c25]">
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#9ac5a9 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative grid min-h-screen lg:grid-cols-[0.82fr_1fr]">
        {/* Left panel */}
        <section className="hidden bg-[#0D3D24] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-white">
                JL
              </div>
              <div>
                <p className="text-xl font-bold">JourneyLite</p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7fc99a]">Admin Portal</p>
              </div>
            </div>
            <h1 className="mt-20 max-w-sm text-5xl font-bold leading-tight tracking-tight text-white">
              Welcome back, staff.
            </h1>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-[#a5d4b4]">
              Manage patient journeys, content, and locations across Ohio, Kentucky, and Indiana.
            </p>
          </div>
          <div className="space-y-5 border-t border-white/15 pt-7">
            <StatRow value="6,000+" label="Gastric sleeves performed" />
            <StatRow value="5" label="Regional locations" />
          </div>
        </section>

        {/* Right panel */}
        <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-20">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3D24] text-sm font-bold text-white">JL</div>
              <div>
                <p className="font-bold text-[#1f2c25]">JourneyLite</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aafa5]">Admin Portal</p>
              </div>
            </div>

            {step === "email" ? (
              <div className="rounded-2xl border border-[#dce4df] bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-[#1f2c25]">Sign in</h2>
                <p className="mt-1.5 text-sm leading-6 text-[#5f6f66]">
                  Enter your admin email. We'll send a secure one-time code — no password needed.
                </p>

                {/* Passwordless info */}
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#c8ddd1] bg-[#edf7f2] p-3.5">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#145c42]" />
                  <div>
                    <p className="text-sm font-semibold text-[#1f2c25]">Secure, passwordless sign-in</p>
                    <p className="mt-0.5 text-xs text-[#5f6f66]">
                      A 6-digit code is emailed to you each time. Only approved admin emails can access the dashboard.
                    </p>
                  </div>
                </div>

                {displayedError && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm">{displayedError}</p>
                  </div>
                )}

                <form className="mt-6 space-y-5" onSubmit={sendCode}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1f2c25]" htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@journeylite.com"
                      className="w-full rounded-xl border border-[#dce4df] px-4 py-2.5 text-sm text-[#1f2c25] placeholder-[#9aafa5] outline-none transition-colors focus:border-[#145c42] focus:ring-2 focus:ring-[#145c42]/20"
                    />
                  </div>

                  {TURNSTILE_SITE_KEY ? (
                    <TurnstileWidget
                      key={turnstileResetKey}
                      action="admin-login"
                      onError={handleTurnstileReset}
                      onExpire={handleTurnstileReset}
                      onVerify={handleTurnstileVerify}
                    />
                  ) : null}
                  {turnstileError ? <p className="text-xs font-semibold text-red-600">{turnstileError}</p> : null}

                  <button
                    type="submit"
                    disabled={isLoading || Boolean(TURNSTILE_SITE_KEY && !turnstileToken)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D3D24] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#145c42] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {isLoading ? "Sending code…" : "Email me a sign-in code"}
                  </button>
                </form>

                <Link
                  href="/"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#9aafa5] transition-colors hover:text-[#0D3D24]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to public site
                </Link>
              </div>
            ) : (
              /* OTP code entry step */
              <div className="rounded-2xl border border-[#dce4df] bg-white p-8 shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4ef]">
                  <Mail className="h-7 w-7 text-[#145c42]" />
                </div>
                <h2 className="text-center text-2xl font-bold text-[#1f2c25]">Check your email</h2>
                <p className="mt-1.5 text-center text-sm leading-6 text-[#5f6f66]">
                  We sent a 6-digit sign-in code to <strong className="text-[#1f2c25]">{email}</strong>. Enter it below.
                </p>

                {error && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={verifyCode}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1f2c25]" htmlFor="code">
                      Sign-in code
                    </label>
                    <input
                      id="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="000000"
                      className="w-full rounded-xl border border-[#dce4df] px-4 py-3 text-center text-2xl tracking-[0.3em] text-[#1f2c25] placeholder-[#9aafa5] outline-none transition-colors focus:border-[#145c42] focus:ring-2 focus:ring-[#145c42]/20"
                    />
                    <p className="text-xs text-[#9aafa5]">The code expires soon. Request a new one if it doesn't work.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || code.replace(/\D/g, "").length < 6}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D3D24] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#145c42] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {isVerifying ? "Verifying…" : "Continue with code"}
                  </button>
                </form>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setCode(""); setError(null); }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#dce4df] px-4 py-2.5 text-sm font-semibold text-[#1f2c25] transition-colors hover:bg-zinc-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={isLoading}
                    className="rounded-xl border border-[#dce4df] px-4 py-2.5 text-sm font-semibold text-[#1f2c25] transition-colors hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {isLoading ? "Sending…" : "Resend code"}
                  </button>
                </div>
              </div>
            )}
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
        <div className="w-full max-w-md rounded-2xl border border-[#dce4df] bg-white p-8 shadow-sm">
          <div className="h-7 w-32 animate-pulse rounded bg-[#edf4ef]" />
          <div className="mt-4 h-4 w-56 animate-pulse rounded bg-[#edf4ef]" />
          <div className="mt-6 h-10 animate-pulse rounded-xl bg-[#edf4ef]" />
          <div className="mt-4 h-12 animate-pulse rounded-xl bg-[#d7e7df]" />
        </div>
      </div>
    </main>
  );
}

function StatRow({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center border-b border-white/15 pb-5 last:border-0 last:pb-0">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-base text-[#a5d4b4]">{label}</span>
    </div>
  );
}
