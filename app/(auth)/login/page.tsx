"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginCardFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : authError.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#dce4df] bg-white p-7 shadow-sm">
      <h1 className="text-2xl font-semibold text-[#1f2c25]">Sign in to your account</h1>
      <p className="mt-1 text-sm text-[#66756d]">Access your bariatric education courses.</p>

      {error && (
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#fca5a5] bg-[#fef2f2] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]" />
          <p className="text-sm text-[#b91c1c]">{error}</p>
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#1f2c25]">
            Email address
          </label>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-[#1f2c25]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#145c42] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 pr-11 text-sm text-[#1f2c25] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa09a] hover:text-[#53635b]"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              type="button"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          className="w-full rounded-md bg-[#145c42] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#66756d]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#145c42] hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

function LoginCardFallback() {
  return (
    <div className="rounded-2xl border border-[#dce4df] bg-white p-7 shadow-sm">
      <div className="h-8 w-56 rounded bg-[#edf4ef]" />
      <div className="mt-3 h-4 w-72 rounded bg-[#edf4ef]" />
      <div className="mt-8 space-y-5">
        <div className="h-12 rounded-lg bg-[#edf4ef]" />
        <div className="h-12 rounded-lg bg-[#edf4ef]" />
        <div className="h-12 rounded-md bg-[#d7e7df]" />
      </div>
    </div>
  );
}
