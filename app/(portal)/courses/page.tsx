import Image from "next/image";
import Link from "next/link";
import { Activity, BookOpen, CheckCircle2, Clock, Film, Layers } from "lucide-react";
import { getCoursePreviewMedia, getCourses, getCourseStats, getFirstLesson } from "@/lib/courses/catalog";

export default function CoursesPage() {
  const courses = getCourses();

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-[#c8ddd4] bg-white p-6 shadow-sm shadow-[#20372b]/5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">JourneyLite courses</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1f2c25] sm:text-4xl">Patient education courses</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#66756d]">
              These courses mirror the exported JourneyLite Open edX course modules, including lesson structure, media,
              activities, quizzes, safety notes, and source references.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[460px]">
            <Metric icon={<BookOpen className="h-4 w-4" />} label="Courses" value={courses.length} />
            <Metric icon={<Layers className="h-4 w-4" />} label="Sections" value={courses.reduce((sum, course) => sum + getCourseStats(course).sections, 0)} />
            <Metric icon={<Activity className="h-4 w-4" />} label="Lessons" value={courses.reduce((sum, course) => sum + getCourseStats(course).lessons, 0)} />
            <Metric icon={<Film className="h-4 w-4" />} label="Media" value={courses.reduce((sum, course) => sum + getCourseStats(course).media, 0)} />
          </div>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        {courses.map((course) => {
          const stats = getCourseStats(course);
          const firstLesson = getFirstLesson(course);
          const media = getCoursePreviewMedia(course);

          return (
            <article className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white shadow-sm shadow-[#20372b]/5" key={course._id}>
              {media?.localPath ? (
                <div className="relative h-56 border-b border-[#dce4df] bg-[#edf4ef]">
                  <Image
                    alt={media.altText || course.title}
                    className="object-contain p-4"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={media.localPath}
                    unoptimized={media.contentType === "image/gif"}
                  />
                </div>
              ) : null}
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#145c42]">
                    {course.clinicalReview?.status ?? "Course"}
                  </span>
                  <span className="rounded-full bg-[#f5f8f6] px-3 py-1 text-xs font-semibold text-[#66756d]">
                    {course.accessType ?? "Patient education"}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#1f2c25]">{course.title}</h2>
                {course.courseSummary ? <p className="mt-3 text-sm leading-6 text-[#66756d]">{course.courseSummary}</p> : null}
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <CourseStat label="Sections" value={stats.sections} />
                  <CourseStat label="Lessons" value={stats.lessons} />
                  <CourseStat label="Quizzes" value={stats.quizzes} />
                  <CourseStat label="Minutes" value={stats.estimatedMinutes} />
                </dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex items-center gap-2 rounded-md bg-[#145c42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4d37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
                    href={`/courses/${course.slug}`}
                  >
                    View course
                  </Link>
                  {firstLesson ? (
                    <Link
                      className="inline-flex items-center gap-2 rounded-md border border-[#cbd7d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f2c25] transition hover:border-[#145c42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
                      href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
                    >
                      Start first lesson
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
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

function CourseStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-[#f5f8f6] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#66756d]">{label}</dt>
      <dd className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-[#1f2c25]">
        {label === "Minutes" ? <Clock className="h-4 w-4 text-[#145c42]" /> : <CheckCircle2 className="h-4 w-4 text-[#145c42]" />}
        {value}
      </dd>
    </div>
  );
}
