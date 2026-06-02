import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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
          Your bariatric learning portal includes the exported JourneyLite course modules, quizzes, and media.
        </p>
      </div>

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
          JourneyLite course library
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c5ddd4]">
          Review the same exported pre-op dietary and medical course material here in the patient portal, including
          lesson media, checkpoints, quizzes, and safety notes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] shadow-sm transition hover:bg-[#edf4ef]"
          >
            Browse Courses
          </Link>
          <Link
            href="/courses/surgical-pre-op-course-dietary-module"
            className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Dietary Module
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-[#dce4df] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1f2c25]">
          What is included
        </h2>
        <p className="mt-1 text-sm text-[#66756d]">
          The local course pages are generated from the JourneyLite course export in this repo. They include 2 courses,
          23 sections, 90 lessons, 90 activity checkpoints, 90 quizzes, and 165 media references.
        </p>
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
