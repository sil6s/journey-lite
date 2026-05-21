"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// window.grecaptcha type is declared in types/recaptcha-enterprise.d.ts

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@journeylite.com");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("error");
  });

  async function getRecaptchaToken() {
    if (!recaptchaSiteKey) return "development-bypass";
    if (!window.grecaptcha?.enterprise) throw new Error("reCAPTCHA Enterprise has not loaded yet.");
    return new Promise<string>((resolve, reject) => {
      window.grecaptcha.enterprise.ready(() => {
        window.grecaptcha.enterprise.execute(recaptchaSiteKey, { action: "admin_login" }).then(resolve).catch(reject);
      });
    });
  }

  async function startGoogleLogin() {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const recaptchaToken = await getRecaptchaToken();
      const response = await fetch("/api/auth/google/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken, next: "/admin" }),
      });
      const payload = (await response.json()) as { url?: string; error?: string; recaptchaBypassed?: boolean };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Google sign-in could not start.");
      if (payload.recaptchaBypassed) toast.message("reCAPTCHA is in development bypass mode.");
      window.location.href = payload.url;
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Google sign-in failed.");
      setIsGoogleLoading(false);
    }
  }

  async function emailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsEmailLoading(true);
    try {
      const recaptchaToken = await getRecaptchaToken();
      const response = await fetch("/api/auth/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; recaptchaBypassed?: boolean };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Email login failed.");
      if (payload.recaptchaBypassed) toast.message("reCAPTCHA is in development bypass mode.");
      toast.success("Admin login complete.");
      router.push("/admin");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Email login failed.");
      setIsEmailLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf7] text-[#173c2b]">
      {recaptchaSiteKey ? <Script src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`} strategy="afterInteractive" /> : null}
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
              <Image alt="JourneyLite favicon" className="size-16 rounded-2xl ring-2 ring-white/20" height={64} priority src="/JLAppIcon.png" width={64} />
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
              <Image alt="JourneyLite favicon" className="size-12 rounded-xl" height={64} priority src="/JLAppIcon.png" width={64} />
              <div>
                <p className="text-lg font-semibold">JourneyLite</p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Admin Portal</p>
              </div>
            </div>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Sign in</h2>
            <p className="mt-5 text-xl text-[#728178]">Access the JourneyLite admin dashboard</p>

            {error ? (
              <Alert className="mt-8" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
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
              <span>or sign in with email</span>
              <span className="h-px bg-[#dde5df]" />
            </div>

            <form className="space-y-7" onSubmit={emailLogin}>
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
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-lg font-semibold text-[#2d4b39]" htmlFor="password">
                    Password
                  </Label>
                  <button className="text-base font-medium text-[#1d6a3b] hover:underline" type="button">
                    Forgot password?
                  </button>
                </div>
                <Input
                  className="h-16 rounded-xl border-[#dbe2dd] px-6 text-lg text-[#173c2b]"
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button
                className="h-16 w-full rounded-xl !bg-[#153f2b] text-lg font-semibold !text-white hover:!bg-[#0f3322]"
                disabled={isGoogleLoading || isEmailLoading}
                type="submit"
              >
                {isEmailLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
                Log in to admin
              </Button>
            </form>

            <Link className="mt-8 inline-flex items-center gap-2 text-lg font-medium text-[#96a89c] hover:text-[#153f2b]" href="/">
              <ArrowLeft className="size-4" />
              Return to public site
            </Link>

            <p className={cn("mt-6 text-xs text-muted-foreground", recaptchaSiteKey ? "sr-only" : "")}>
              reCAPTCHA v3 keys are not configured yet. Development login is using server-side bypass mode.
            </p>
          </div>
        </section>
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
