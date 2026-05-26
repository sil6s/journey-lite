import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ExternalLink, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  edxDashboardUrl,
  edxCourseCatalogUrl,
  OPENEDX_LMS_URL,
} from "@/lib/openedx/config";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = profile?.full_name?.split(" ")[0] ?? null;
  const greeting = firstName ? `Welcome back, ${firstName}.` : "Welcome back.";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#dce4df] pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">
          Patient Education Center
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2c25] sm:text-4xl">
          {greeting}
        </h1>
        <p className="mt-2 text-base text-[#66756d]">
          Your bariatric learning portal is powered by Open edX.
        </p>
      </div>

      {/* Open edX learning portal CTA */}
      <section
        aria-labelledby="portal-heading"
        className="rounded-2xl border border-[#c8ddd4] bg-gradient-to-br from-[#0f3e2e] to-[#145c42] px-6 py-10 text-white sm:px-10"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#7cc9a8]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#7cc9a8]">
            Learning Portal
          </span>
        </div>
        <h2
          id="portal-heading"
          className="mt-3 text-2xl font-semibold sm:text-3xl"
        >
          Bariatric Learning Portal
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c5ddd4]">
          Evidence-based courses designed to support you at every stage of your
          bariatric journey — from preparing for surgery to building long-term
          healthy habits.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={edxDashboardUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] shadow-sm transition hover:bg-[#edf4ef]"
          >
            My Courses
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={edxCourseCatalogUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse Courses
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* Info card: portal URL */}
      <section className="rounded-2xl border border-[#dce4df] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1f2c25]">
          Your learning portal
        </h2>
        <p className="mt-1 text-sm text-[#66756d]">
          All course content, progress tracking, quizzes, and certificates are
          managed in your JourneyLite Open edX portal.
        </p>
        <a
          href={OPENEDX_LMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#145c42] hover:underline"
        >
          {OPENEDX_LMS_URL}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </section>

      {/* Support CTA */}
      <section className="rounded-2xl border border-[#c8ddd4] bg-[#f0f8f4] p-6">
        <h2 className="text-base font-semibold text-[#1f2c25]">
          Have questions about your care plan?
        </h2>
        <p className="mt-1 text-sm text-[#66756d]">
          Your JourneyLite team is here to help with your diet plan, vitamins,
          appointments, and more.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="tel:+18774422263"
            className="inline-flex items-center gap-2 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37]"
          >
            <Phone className="h-4 w-4" />
            Call 877-442-2263
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42]"
          >
            Send a message
          </Link>
        </div>
      </section>
    </div>
  );
}
