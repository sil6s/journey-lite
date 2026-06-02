import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OPENEDX_LMS_URL,
  OPENEDX_CMS_URL,
  edxCourseCatalogUrl,
  edxDashboardUrl,
} from "@/lib/openedx/config";

const adminLinks = [
  {
    title: "Course Studio (CMS)",
    href: `${OPENEDX_CMS_URL}`,
    icon: BookOpen,
    description:
      "Author and manage courses in Open edX Studio. Create sections, units, and XBlocks. Upload video and SCORM content.",
    external: true,
  },
  {
    title: "Learner Dashboard",
    href: edxDashboardUrl(),
    icon: LayoutDashboard,
    description:
      "Preview the learner experience — see enrolled courses, progress, and certificates exactly as patients do.",
    external: true,
  },
  {
    title: "Course Catalog",
    href: edxCourseCatalogUrl(),
    icon: GraduationCap,
    description:
      "Browse all published courses on the Open edX instance. Verify enrollment status and course availability.",
    external: true,
  },
  {
    title: "Admin Panel (LMS)",
    href: `${OPENEDX_LMS_URL}/admin/`,
    icon: Settings,
    description:
      "Django admin for the Open edX LMS. Manage users, enrollments, certificates, and OAuth2 applications.",
    external: true,
  },
  {
    title: "Admin Panel (CMS)",
    href: `${OPENEDX_CMS_URL}/admin/`,
    icon: Settings,
    description:
      "Django admin for Open edX Studio. Manage course organizations, export/import course packages.",
    external: true,
  },
  {
    title: "Patient Enrollments",
    href: `${OPENEDX_LMS_URL}/admin/student/courseenrollment/`,
    icon: Users,
    description:
      "View and manage patient course enrollments directly. Enroll or unenroll users, check enrollment modes.",
    external: true,
  },
];

const setupSteps = [
  {
    step: "1",
    title: "Install Tutor",
    body: 'pip install "tutor[full]" — or download the pre-compiled binary from GitHub.',
  },
  {
    step: "2",
    title: "Launch Open edX",
    body: "tutor local launch — answers a few questions then spins up a full Open edX instance via Docker Compose in < 10 minutes.",
  },
  {
    step: "3",
    title: "Set environment variables",
    body: "Add NEXT_PUBLIC_OPENEDX_LMS_URL and NEXT_PUBLIC_OPENEDX_CMS_URL to .env.local (dev) and your production environment.",
  },
  {
    step: "4",
    title: "Register OAuth2 application",
    body: "In Django Admin → OAuth2 → Applications, add a confidential client for this Next.js app. Set redirect URI to /api/auth/openedx/callback.",
  },
  {
    step: "5",
    title: "Add OAuth2 credentials",
    body: "Set OPENEDX_CLIENT_ID and OPENEDX_CLIENT_SECRET in your environment to enable SSO between this app and Open edX.",
  },
  {
    step: "6",
    title: "Build courses in Studio",
    body: "Log into Studio at the CMS URL above and create your bariatric education courses. Use the Instructor Dashboard to assign courses to patients.",
  },
];

export default function AdminEducationPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Patient Education — Open edX</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            The JourneyLite patient education portal is now powered by{" "}
            <strong>Open edX (Tutor)</strong>. Use Studio to author courses and the links below to
            manage content, enrollments, and learner progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={OPENEDX_CMS_URL} target="_blank" rel="noopener noreferrer">
              Open Studio
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={edxCourseCatalogUrl()} target="_blank" rel="noopener noreferrer">
              Course Catalog
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <item.icon className="size-4" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  Open
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup guide */}
      <Card>
        <CardHeader>
          <CardTitle>Open edX Setup Guide</CardTitle>
          <CardDescription>
            Steps to get the Tutor-based Open edX instance running locally or in production.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {setupSteps.map((s) => (
              <li key={s.step} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#145c42] text-xs font-bold text-white">
                  {s.step}
                </span>
                <div>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Environment config:</strong> set{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              NEXT_PUBLIC_OPENEDX_LMS_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              NEXT_PUBLIC_OPENEDX_CMS_URL
            </code>{" "}
            in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>.
            Currently pointing to:{" "}
            <a
              className="font-medium text-[#145c42] hover:underline"
              href={OPENEDX_LMS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {OPENEDX_LMS_URL}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Docs link */}
      <Card>
        <CardHeader>
          <CardTitle>Tutor Documentation</CardTitle>
          <CardDescription>Official docs, plugin catalog, and community support.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[
            { label: "Tutor Docs", href: "https://docs.tutor.edly.io/" },
            { label: "Open edX REST APIs", href: "https://docs.openedx.org/projects/edx-platform/en/latest/references/rest_api/" },
            { label: "Source code (GitHub)", href: "https://github.com/overhangio/tutor" },
            { label: "Community forum", href: "https://discuss.openedx.org/" },
          ].map((link) => (
            <Button key={link.label} asChild variant="outline" size="sm">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
                <ExternalLink className="ml-1.5 h-3 w-3" />
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Sanity note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-900">Sanity LMS schemas removed</CardTitle>
          <CardDescription className="text-amber-700">
            The Sanity-based patient education schemas (lmsCourse, lmsLesson, lmsSection, etc.)
            have been removed. Sanity is now used exclusively for the blog and practice info.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-amber-800">
          Course content that was exported from Sanity can be found in{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
            exports/education-course-details.json
          </code>
          . Use the Open edX course import (OLX format) or Studio to rebuild/import these courses.
          See{" "}
          <Link href="/admin/education" className="font-medium underline">
            the setup guide above
          </Link>{" "}
          to get started.
        </CardContent>
      </Card>
    </div>
  );
}
