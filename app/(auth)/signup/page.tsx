"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[#c8ddd4] bg-white p-7 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7]">
          <CheckCircle className="h-8 w-8 text-[#15803d]" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-[#1f2c25]">Check your email</h1>
        <p className="mt-2 text-sm leading-6 text-[#66756d]">
          We sent a confirmation link to <strong className="text-[#1f2c25]">{email}</strong>.
          Click the link to activate your account and access your courses.
        </p>
        <p className="mt-4 text-xs text-[#8fa09a]">
          Didn&apos;t get it? Check your spam folder or{" "}
          <button
            className="font-semibold text-[#145c42] underline-offset-2 hover:underline"
            onClick={() => setDone(false)}
            type="button"
          >
            try again
          </button>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce4df] bg-white p-7 shadow-sm">
      <h1 className="text-2xl font-semibold text-[#1f2c25]">Create your account</h1>
      <p className="mt-1 text-sm text-[#66756d]">
        Access your personalized bariatric education courses.
      </p>

      {error && (
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#fca5a5] bg-[#fef2f2] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]" />
          <p className="text-sm text-[#b91c1c]">{error}</p>
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-[#1f2c25]">
            Full name
          </label>
          <input
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            id="fullName"
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            required
            type="text"
            value={fullName}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#1f2c25]">
            Email address
          </label>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-[#1f2c25]">
            Password
          </label>
          <div className="relative mt-2">
            <input
              autoComplete="new-password"
              className="w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 pr-11 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
              id="password"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
          <p className="mt-1.5 text-xs text-[#8fa09a]">At least 8 characters.</p>
        </div>

        <button
          className="w-full rounded-md bg-[#145c42] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-xs leading-5 text-[#8fa09a]">
        By creating an account you agree this portal is for educational purposes only. It does not
        constitute medical advice.
      </p>

      <p className="mt-4 text-center text-sm text-[#66756d]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#145c42] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
