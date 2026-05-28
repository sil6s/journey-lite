import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, BookOpen, CheckCircle2, Clock, Film, Layers } from "lucide-react";
import { getCourse, getCourses, getCourseStats, getFirstLesson } from "@/lib/courses/catalog";

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};

  return {
    title: `${course.title} | JourneyLite Courses`,
    description: course.courseSummary,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const stats = getCourseStats(course);
  const firstLesson = getFirstLesson(course);

  return (
    <div className="space-y-8">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#53635b] hover:text-[#145c42]" href="/courses">
        <ArrowLeft className="h-4 w-4" />
        All courses
      </Link>

      <header className="rounded-2xl border border-[#c8ddd4] bg-white p-6 shadow-sm shadow-[#20372b]/5 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#145c42]">
            {course.clinicalReview?.status ?? "Course"}
          </span>
          <span className="rounded-full bg-[#f5f8f6] px-3 py-1 text-xs font-semibold text-[#66756d]">
            {course.audience ?? "JourneyLite patients"}
          </span>
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1f2c25] sm:text-4xl">{course.title}</h1>
            {course.courseSummary ? <p className="mt-3 max-w-3xl text-base leading-7 text-[#66756d]">{course.courseSummary}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <HeaderStat icon={<Layers className="h-4 w-4" />} label="Sections" value={stats.sections} />
            <HeaderStat icon={<BookOpen className="h-4 w-4" />} label="Lessons" value={stats.lessons} />
            <HeaderStat icon={<Activity className="h-4 w-4" />} label="Activities" value={stats.activities} />
            <HeaderStat icon={<Film className="h-4 w-4" />} label="Media" value={stats.media} />
          </div>
        </div>
        {firstLesson ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
              href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
            >
              Start course
            </Link>
            <span className="inline-flex items-center gap-2 rounded-md border border-[#dce4df] bg-[#f8fbf9] px-4 py-2.5 text-sm font-semibold text-[#53635b]">
              <Clock className="h-4 w-4 text-[#145c42]" />
              About {stats.estimatedMinutes} minutes
            </span>
          </div>
        ) : null}
      </header>

      <div className="space-y-5">
        {course.sections.map((section, sectionIndex) => (
          <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-sm shadow-[#20372b]/5" key={section._id}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf2ef] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#145c42]">Section {sectionIndex + 1}</p>
                <h2 className="mt-1 text-xl font-semibold text-[#1f2c25]">{section.title}</h2>
                {section.description ? <p className="mt-1 text-sm leading-6 text-[#66756d]">{section.description}</p> : null}
              </div>
              <span className="rounded-full bg-[#f5f8f6] px-3 py-1 text-xs font-semibold text-[#66756d]">
                {section.lessons.length} lesson{section.lessons.length === 1 ? "" : "s"}
              </span>
            </div>

            <ol className="mt-4 divide-y divide-[#edf2ef]">
              {section.lessons.map((lesson, lessonIndex) => (
                <li className="py-3 first:pt-0 last:pb-0" key={lesson._id}>
                  <Link
                    className="group grid gap-3 rounded-lg p-2 transition hover:bg-[#f8fbf9] sm:grid-cols-[auto_1fr_auto] sm:items-center"
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf7f1] text-sm font-semibold text-[#145c42]">
                      {lessonIndex + 1}
                    </span>
                    <span>
                      <span className="block font-semibold text-[#1f2c25] group-hover:text-[#145c42]">{lesson.title}</span>
                      <span className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-[#66756d]">
                        {lesson.estimatedMinutes ? <span>{lesson.estimatedMinutes} min</span> : null}
                        {lesson.interactiveComponent?.interactionType ? <span>{humanize(lesson.interactiveComponent.interactionType)}</span> : null}
                        {lesson.quiz?.questions?.length ? <span>{lesson.quiz.questions.length} question quiz</span> : null}
                        {lesson.media?.length ? <span>{lesson.media.length} media item{lesson.media.length === 1 ? "" : "s"}</span> : null}
                      </span>
                    </span>
                    <CheckCircle2 className="hidden h-5 w-5 text-[#9aab9f] sm:block" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function HeaderStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#dce4df] bg-[#f8fbf9] p-3">
      <div className="flex items-center gap-2 text-[#145c42]">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#1f2c25]">{value}</p>
    </div>
  );
}

function humanize(value: string) {
  return value.replace(/_/g, " ");
}
