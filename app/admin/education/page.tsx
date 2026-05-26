import Link from "next/link";
import { BookOpen, ClipboardCheck, FileCheck2, GraduationCap, ListChecks, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  completionRulePresets,
  defaultSafetyFooter,
  dietSafetyLanguage,
  interactionGuidance,
  lessonTemplateSections,
  medicationSafetyLanguage,
  patientFacingBannedTerms,
  urgentSafetyFooter,
} from "@/lib/lms/content-rules";

const builderLinks = [
  { title: "Courses", studioType: "Enhanced Courses", href: "/studio", icon: GraduationCap, description: "Build course settings, modules, review, publishing, and certificate controls." },
  { title: "Modules / Sections", studioType: "Enhanced Sections", href: "/studio", icon: ListChecks, description: "Arrange lessons, module descriptions, intro cards, summaries, and module-level quizzes." },
  { title: "Lessons", studioType: "Enhanced Lessons", href: "/studio", icon: BookOpen, description: "Edit lesson copy, media, activities, quizzes, safety language, and completion requirements." },
  { title: "Clinical Review Queue", studioType: "Clinical Review Statuses", href: "/studio", icon: ShieldCheck, description: "Approve, request changes, record reviewer notes, and track reviewed versions." },
  { title: "Certificates", studioType: "Enhanced Courses", href: "/studio", icon: FileCheck2, description: "Enable certificates and configure certificate wording, signature, print, and PDF controls." },
  { title: "Patient Assignments", href: "/admin/education#assignments", icon: Users, description: "Review assignment and progress reporting requirements for the LMS tables." },
];

export default function AdminEducationPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Education Builder</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Guided hub for JourneyLite patient education. Use these tools to build, review, publish, assign, track, and
            certify patient courses without editing raw backend structures.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/studio">Open Course Builder</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/courses">Patient Preview</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {builderLinks.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <item.icon className="size-4" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {"studioType" in item ? (
                <p className="mb-3 text-xs text-muted-foreground">
                  In Studio, open Patient Education, then {item.studioType}.
                </p>
              ) : null}
              <Button asChild variant="outline">
                <Link href={item.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-5" />
              Lesson Template
            </CardTitle>
            <CardDescription>Preferred patient-facing lesson structure.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {lessonTemplateSections.map((section) => (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm font-medium" key={section}>
                  {section}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Every lesson should include a clear reason it matters, specific patient actions, a clear ending, and safety
              guidance when relevant.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient-Facing Copy Rules</CardTitle>
            <CardDescription>Terms and phrases that should not appear in lessons.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {patientFacingBannedTerms.map((term) => (
              <Badge key={term} variant="secondary">
                {term}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Completion Requirement Presets</CardTitle>
          <CardDescription>Use the least friction needed for the lesson risk level.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {completionRulePresets.map((preset) => (
            <article className="rounded-xl border p-4" key={preset.label}>
              <h2 className="font-semibold">{preset.label}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{preset.guidance}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {preset.value.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </article>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interaction Type Guidance</CardTitle>
          <CardDescription>Use activities when they help patients practice decisions or confirm readiness.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {interactionGuidance.map(([type, guidance]) => (
            <article className="rounded-lg border p-4" key={type}>
              <h2 className="font-mono text-sm font-semibold">{type}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{guidance}</p>
            </article>
          ))}
        </CardContent>
      </Card>

      <Card id="assignments">
        <CardHeader>
          <CardTitle>Safety Language</CardTitle>
          <CardDescription>Reusable language for lesson footers and high-risk topics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[
            ["Default safety footer", defaultSafetyFooter],
            ["Urgent safety footer", urgentSafetyFooter],
            ["Medication safety", medicationSafetyLanguage],
            ["Diet safety", dietSafetyLanguage],
          ].map(([title, copy]) => (
            <article className="rounded-lg border bg-muted/30 p-4" key={title}>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
