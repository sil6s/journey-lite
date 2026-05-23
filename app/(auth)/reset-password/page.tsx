"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Supabase handles the token from the URL fragment automatically on mount
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        setError(authError.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
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
        <h1 className="mt-5 text-2xl font-semibold text-[#1f2c25]">Password updated</h1>
        <p className="mt-2 text-sm text-[#66756d]">Redirecting you to your dashboard…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-[#dce4df] bg-white p-7 text-center text-sm text-[#66756d]">
        Loading reset form…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce4df] bg-white p-7 shadow-sm">
      <h1 className="text-2xl font-semibold text-[#1f2c25]">Set a new password</h1>
      <p className="mt-1 text-sm text-[#66756d]">Choose a secure password for your account.</p>

      {error && (
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#fca5a5] bg-[#fef2f2] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]" />
          <p className="text-sm text-[#b91c1c]">{error}</p>
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-[#1f2c25]">
            New password
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
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-semibold text-[#1f2c25]">
            Confirm new password
          </label>
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-[#cbd7d0] bg-white px-4 py-3 text-sm text-[#1f2c25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"
            id="confirm"
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            required
            type={showPassword ? "text" : "password"}
            value={confirm}
          />
        </div>

        <button
          className="w-full rounded-md bg-[#145c42] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
