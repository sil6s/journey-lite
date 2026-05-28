import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, ExternalLink, ShieldAlert } from "lucide-react";
import { LessonQuiz } from "@/components/lms/LessonQuiz";
import {
  getAdjacentLessons,
  getCourseLesson,
  getCourses,
  type CourseLesson,
  type CourseMedia,
} from "@/lib/courses/catalog";

type LessonPageProps = {
  params: Promise<{ slug: string; lessonSlug: string }>;
};

export function generateStaticParams() {
  return getCourses().flatMap((course) =>
    course.sections.flatMap((section) =>
      section.lessons.map((lesson) => ({
        slug: course.slug,
        lessonSlug: lesson.slug,
      }))
    )
  );
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const result = getCourseLesson(slug, lessonSlug);
  if (!result) return {};

  return {
    title: `${result.lesson.title} | ${result.course.title}`,
    description: result.lesson.contentSections?.[0]?.body?.[0] ?? result.course.courseSummary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonSlug } = await params;
  const result = getCourseLesson(slug, lessonSlug);
  if (!result) notFound();

  const { course, section, lesson } = result;
  const adjacent = getAdjacentLessons(course, lesson.slug);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#53635b] hover:text-[#145c42]" href={`/courses/${course.slug}`}>
          <ArrowLeft className="h-4 w-4" />
          Course outline
        </Link>
        <nav className="mt-4 max-h-[calc(100vh-8rem)] overflow-auto rounded-2xl border border-[#dce4df] bg-white p-4 shadow-sm shadow-[#20372b]/5" aria-label="Course lessons">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#145c42]">{course.title}</p>
          <div className="mt-4 space-y-4">
            {course.sections.map((courseSection) => (
              <div key={courseSection._id}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a9891]">{courseSection.title}</p>
                <ol className="mt-2 space-y-1">
                  {courseSection.lessons.map((item) => {
                    const active = item.slug === lesson.slug;
                    return (
                      <li key={item._id}>
                        <Link
                          className={`block rounded-md px-3 py-2 text-sm leading-5 transition ${
                            active
                              ? "bg-[#145c42] font-semibold text-white"
                              : "text-[#53635b] hover:bg-[#f5f8f6] hover:text-[#1f2c25]"
                          }`}
                          href={`/courses/${course.slug}/lessons/${item.slug}`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <article className="min-w-0 space-y-6">
        <header className="rounded-2xl border border-[#c8ddd4] bg-white p-6 shadow-sm shadow-[#20372b]/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">{section.title}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2c25] sm:text-4xl">{lesson.title}</h1>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#53635b]">
            {lesson.estimatedMinutes ? <Pill icon={<Clock className="h-3.5 w-3.5" />} label={`${lesson.estimatedMinutes} min`} /> : null}
            {lesson.interactiveComponent?.interactionType ? <Pill icon={<Activity className="h-3.5 w-3.5" />} label={humanize(lesson.interactiveComponent.interactionType)} /> : null}
            {lesson.quiz?.questions?.length ? <Pill icon={<BookOpen className="h-3.5 w-3.5" />} label={`${lesson.quiz.questions.length} question quiz`} /> : null}
            {lesson.completionRequires?.map((item) => (
              <Pill icon={<CheckCircle2 className="h-3.5 w-3.5" />} key={item} label={humanize(item)} />
            ))}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <LessonObjectives lesson={lesson} />
            <LessonMedia media={lesson.media ?? []} />
            <LessonContent lesson={lesson} />
            <ActivityCard lesson={lesson} />
            <LessonQuiz quiz={lesson.quiz} />
            <SafetyCard lesson={lesson} />
            <LessonNavigation courseSlug={course.slug} next={adjacent.next} previous={adjacent.previous} />
          </div>

          <aside className="space-y-4">
            <References lesson={lesson} />
            {lesson.sourceUrl ? (
              <a
                className="flex items-center justify-between gap-3 rounded-xl border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] shadow-sm shadow-[#20372b]/5 transition hover:border-[#145c42]"
                href={lesson.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Original source page
                <ExternalLink className="h-4 w-4 text-[#145c42]" />
              </a>
            ) : null}
          </aside>
        </div>
      </article>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f8f6] px-3 py-1">
      {icon}
      {label}
    </span>
  );
}

function LessonObjectives({ lesson }: { lesson: CourseLesson }) {
  const objectives = lesson.learningObjectives?.filter(Boolean) ?? [];
  if (!objectives.length) return null;

  return (
    <section className="rounded-xl border border-[#dce4df] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#145c42]">Learning objectives</p>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[#53635b]">
        {objectives.map((objective) => (
          <li className="flex gap-3" key={objective}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#145c42]" />
            <span>{objective}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LessonMedia({ media }: { media: CourseMedia[] }) {
  const items = media.filter((item) => item.localPath);
  if (!items.length) return null;

  return (
    <section className="rounded-xl border border-[#dce4df] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#145c42]">Course media</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <figure className="rounded-lg border border-[#edf2ef] bg-[#f8fbf9] p-3" key={`${item.localPath}-${item.title}`}>
            <div className="relative min-h-56 overflow-hidden rounded-md bg-white">
              <Image
                alt={item.altText || item.title || "Course media"}
                className="object-contain p-2"
                fill
                sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
                src={item.localPath ?? ""}
                unoptimized={item.contentType === "image/gif"}
              />
            </div>
            {item.caption || item.title ? (
              <figcaption className="mt-2 text-xs leading-5 text-[#66756d]">{item.caption || item.title}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

function LessonContent({ lesson }: { lesson: CourseLesson }) {
  const sections = lesson.contentSections?.filter((section) => section.heading || section.body?.length) ?? [];
  if (!sections.length) return null;

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <section className="rounded-xl border border-[#dce4df] bg-white p-5" key={`${section.heading}-${index}`}>
          {section.heading ? <h2 className="text-xl font-semibold text-[#1f2c25]">{section.heading}</h2> : null}
          <div className="mt-3 space-y-3 text-base leading-7 text-[#53635b]">
            {section.body?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ActivityCard({ lesson }: { lesson: CourseLesson }) {
  const activity = lesson.interactiveComponent;
  if (!activity) return null;

  return (
    <section className="rounded-xl border border-[#d8c88b] bg-[#fffdf4] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a16]">Interactive activity</p>
      <h2 className="mt-1 text-xl font-semibold text-[#1f2c25]">{activity.title ?? humanize(activity.interactionType ?? "Activity")}</h2>
      {activity.description ? <p className="mt-3 text-sm leading-6 text-[#6a5520]">{activity.description}</p> : null}
      <div className="mt-4 rounded-lg border border-[#eadb9d] bg-white p-4 text-sm leading-6 text-[#5e5235]">
        <p className="font-semibold text-[#1f2c25]">{humanize(activity.interactionType ?? "activity")}</p>
        <p className="mt-1">
          This mirrors the Open edX activity configuration. Patients should complete the activity before marking the
          lesson complete.
        </p>
      </div>
    </section>
  );
}

function SafetyCard({ lesson }: { lesson: CourseLesson }) {
  if (!lesson.patientSafetyFooter && !lesson.safetyEscalationTopics?.length) return null;

  return (
    <section className="rounded-xl border border-[#efd3c4] bg-[#fff7f2] p-5">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-[#9b4a25]" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b4a25]">Safety note</p>
      </div>
      {lesson.patientSafetyFooter ? <p className="mt-3 text-sm leading-6 text-[#6f482f]">{lesson.patientSafetyFooter}</p> : null}
      {lesson.safetyEscalationTopics?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {lesson.safetyEscalationTopics.map((topic) => (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7a4a2f]" key={topic}>
              {humanize(topic)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function References({ lesson }: { lesson: CourseLesson }) {
  const references = lesson.evidenceReferences?.filter((item) => item.label || item.url) ?? [];
  if (!references.length) return null;

  return (
    <section className="rounded-xl border border-[#dce4df] bg-white p-4 shadow-sm shadow-[#20372b]/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#145c42]">References</p>
      <ol className="mt-3 space-y-3 text-sm leading-6 text-[#53635b]">
        {references.map((reference, index) => (
          <li key={`${reference.label}-${index}`}>
            {reference.url ? (
              <a className="font-semibold text-[#1f2c25] underline-offset-4 hover:text-[#145c42] hover:underline" href={reference.url} rel="noopener noreferrer" target="_blank">
                {reference.label || reference.url}
              </a>
            ) : (
              <span className="font-semibold text-[#1f2c25]">{reference.label}</span>
            )}
            {reference.use ? <p className="mt-1 text-xs leading-5 text-[#66756d]">{reference.use}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function LessonNavigation({ courseSlug, next, previous }: { courseSlug: string; next: CourseLesson | null; previous: CourseLesson | null }) {
  return (
    <nav className="grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
      {previous ? (
        <Link className="rounded-xl border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42]" href={`/courses/${courseSlug}/lessons/${previous.slug}`}>
          <span className="flex items-center gap-2 text-[#66756d]">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </span>
          <span className="mt-1 block">{previous.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link className="rounded-xl border border-[#dce4df] bg-white p-4 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] sm:text-right" href={`/courses/${courseSlug}/lessons/${next.slug}`}>
          <span className="flex items-center gap-2 text-[#66756d] sm:justify-end">
            Next
            <ArrowRight className="h-4 w-4" />
          </span>
          <span className="mt-1 block">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}

function humanize(value: string) {
  return value.replace(/_/g, " ");
}
