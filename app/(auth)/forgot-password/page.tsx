"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
          If an account exists for <strong className="text-[#1f2c25]">{email}</strong>, you&apos;ll
          receive a password reset link shortly.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-md border border-[#cbd7d0] px-5 py-2.5 text-sm font-semibold text-[#1f2c25] hover:border-[#145c42]"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce4df] bg-white p-7 shadow-sm">
      <h1 className="text-2xl font-semibold text-[#1f2c25]">Reset your password</h1>
      <p className="mt-1 text-sm text-[#66756d]">
        Enter your email address and we&apos;ll send you a reset link.
      </p>

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
            className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            type="email"
            value={email}
          />
        </div>

        <button
          className="w-full rounded-md bg-[#145c42] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#66756d]">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-[#145c42] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
