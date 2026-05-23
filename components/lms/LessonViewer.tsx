"use client";

import { useEffect } from "react";
import { Lightbulb, AlertTriangle, Info, Calendar, Download, ExternalLink } from "lucide-react";
import { PortableTextRenderer } from "@/app/components/PortableTextRenderer";
import { VideoEmbed } from "./VideoEmbed";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { updateLastViewed } from "@/lib/lms/actions";
import { InteractiveComponentRenderer, KnowledgeCheck } from "./InteractiveRegistry";
import type { SanityLesson } from "@/src/lib/sanity/lms-types";
import type { LessonProgressRecord } from "@/src/lib/sanity/lms-types";
import type { CompletionRequirement } from "@/lib/lms/actions";

interface LessonViewerProps {
  lesson: SanityLesson;
  courseSlug: string;
  moduleSlug: string | null;
  progress: LessonProgressRecord | null;
  isAuthenticated: boolean;
}

const calloutStyles = {
  note: { bg: "bg-[#eff6ff] border-[#bfdbfe]", icon: <Info className="h-5 w-5 text-[#2563eb]" />, titleColor: "text-[#1d4ed8]" },
  tip: { bg: "bg-[#f0fdf4] border-[#bbf7d0]", icon: <Lightbulb className="h-5 w-5 text-[#16a34a]" />, titleColor: "text-[#15803d]" },
  warning: { bg: "bg-[#fffbeb] border-[#fde68a]", icon: <AlertTriangle className="h-5 w-5 text-[#d97706]" />, titleColor: "text-[#b45309]" },
  "appointment-reminder": { bg: "bg-[#faf5ff] border-[#e9d5ff]", icon: <Calendar className="h-5 w-5 text-[#9333ea]" />, titleColor: "text-[#7c3aed]" },
} as const;

export function LessonViewer({ lesson, courseSlug, moduleSlug, progress, isAuthenticated }: LessonViewerProps) {
  useEffect(() => {
    if (isAuthenticated) {
      updateLastViewed(courseSlug, moduleSlug, lesson.slug).catch(() => {});
    }
  }, [courseSlug, moduleSlug, lesson.slug, isAuthenticated]);

  return (
    <div className="space-y-8">
      {/* Video */}
      {lesson.videoUrl && <VideoEmbed url={lesson.videoUrl} />}

      {lesson.media && lesson.media.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {lesson.media.map((media) => {
            const src = media.assetUrl ?? media.localPath ?? (media.originalPath ? `/lms-media/${media.originalPath.replace(/^media\//, "")}` : null);
            return (
              <figure className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white" key={media._id}>
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={media.altText ?? media.title}
                    className="h-auto w-full object-contain"
                    src={src}
                  />
                ) : (
                  <div className="p-4 text-sm text-[#66756d]">{media.title}</div>
                )}
                <figcaption className="border-t border-[#edf1ee] px-4 py-3 text-xs leading-5 text-[#66756d]">
                  {media.caption ?? media.title}
                  <span className="mt-1 block font-mono text-[11px] text-[#8fa09a]">{media.originalPath}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {/* Key takeaways */}
      {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
        <div className="rounded-2xl border border-[#c8ddd4] bg-[#f0f8f4] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">
            Key Takeaways
          </p>
          <ul className="mt-3 space-y-2">
            {lesson.keyTakeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-[#355346]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#145c42]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Callout boxes */}
      {lesson.calloutBoxes?.map((callout) => {
        const style = calloutStyles[callout.type] ?? calloutStyles.note;
        return (
          <div
            key={callout._key}
            className={`flex gap-3 rounded-xl border p-4 ${style.bg}`}
            role="note"
          >
            <span className="mt-0.5 shrink-0">{style.icon}</span>
            <div>
              {callout.title && (
                <p className={`text-sm font-semibold ${style.titleColor}`}>{callout.title}</p>
              )}
              {callout.body && (
                <p className="mt-1 text-sm leading-6 text-[#53635b]">{callout.body}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Lesson body */}
      {lesson.contentSections && lesson.contentSections.length > 0 && (
        <article className="space-y-5">
          {lesson.contentSections.map((section) => (
            <section className="rounded-2xl border border-[#dce4df] bg-white p-5" key={section._key}>
              {section.heading ? <h2 className="text-xl font-semibold text-[#1f2c25]">{section.heading}</h2> : null}
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#53635b]">
                {section.body?.map((paragraph, index) => (
                  <p key={`${section._key}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      )}

      {lesson.body && lesson.body.length > 0 && (
        <article className="prose-sm max-w-none">
          <PortableTextRenderer value={lesson.body as never} />
        </article>
      )}

      {lesson.interactiveComponent ? (
        <InteractiveComponentRenderer
          component={lesson.interactiveComponent}
          courseSlug={courseSlug}
          lessonSlug={lesson.slug}
        />
      ) : null}

      {lesson.quiz ? (
        <KnowledgeCheck quiz={lesson.quiz} courseSlug={courseSlug} lessonSlug={lesson.slug} />
      ) : null}

      {lesson.evidenceReferences && lesson.evidenceReferences.length > 0 ? (
        <details className="rounded-2xl border border-[#dce4df] bg-white p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[#1f2c25]">
            Evidence and source references
          </summary>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            {lesson.evidenceReferences.map((reference) => (
              <li key={reference._id}>
                {reference.url ? (
                  <a className="font-semibold text-[#145c42] hover:underline" href={reference.url} rel="noreferrer" target="_blank">
                    {reference.label}
                  </a>
                ) : (
                  <span className="font-semibold text-[#1f2c25]">{reference.label}</span>
                )}
                {reference.use ? <p className="text-[#66756d]">{reference.use}</p> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {/* Downloads */}
      {lesson.downloads && lesson.downloads.length > 0 && (
        <div className="rounded-2xl border border-[#dce4df] bg-white p-5">
          <p className="text-sm font-semibold text-[#1f2c25]">Downloads</p>
          <ul className="mt-3 space-y-2">
            {lesson.downloads.map((dl) => (
              <li key={dl._id}>
                {dl.fileUrl ? (
                  <a
                    className="flex items-center gap-3 rounded-lg border border-[#dce4df] p-3 text-sm text-[#1f2c25] transition hover:border-[#145c42] hover:bg-[#f5f8f6]"
                    download
                    href={dl.fileUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Download className="h-4 w-4 shrink-0 text-[#145c42]" />
                    <span className="flex-1">{dl.title}</span>
                    {dl.resourceType && (
                      <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#64748b]">
                        {dl.resourceType}
                      </span>
                    )}
                    <ExternalLink className="h-3.5 w-3.5 text-[#8fa09a]" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-[#dce4df] p-3 text-sm text-[#8fa09a]">
                    <Download className="h-4 w-4" />
                    {dl.title} (file not available)
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mark complete */}
      {isAuthenticated && (
        <div className="flex items-center justify-between rounded-xl border border-[#dce4df] bg-white p-5">
          <div>
            <p className="text-sm font-semibold text-[#1f2c25]">
              {progress?.completed ? "You've completed this lesson." : "Ready to move on?"}
            </p>
            <p className="text-xs text-[#66756d]">
              {progress?.completed
                ? "You can mark it incomplete to revisit."
                : "Mark this lesson complete when you're done."}
            </p>
          </div>
          <MarkCompleteButton
            courseSlug={courseSlug}
            sectionTitle={moduleSlug}
            lessonSlug={lesson.slug}
            initialCompleted={progress?.completed ?? false}
            requirements={(lesson.completionRequires ?? []) as CompletionRequirement[]}
          />
        </div>
      )}

      <footer className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-5" role="contentinfo">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b45309]" />
          <div>
            <p className="text-sm font-semibold text-[#92400e]">Patient safety note</p>
            <p className="mt-1 text-sm leading-6 text-[#78350f]">
              {lesson.patientSafetyFooter ??
                "This education supports your JourneyLite care plan but does not replace individualized medical advice. Follow your clinical team's instructions and contact JourneyLite for questions or new/worsening symptoms."}
            </p>
          </div>
        </div>
      </footer>

      {/* Next step CTA */}
      {lesson.nextStepCta?.href && lesson.nextStepCta.label && (
        <div className="rounded-2xl bg-[#0f3e2e] p-6 text-white">
          <p className="text-sm font-semibold">Next step</p>
          <a
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] transition hover:bg-[#edf4ef]"
            href={lesson.nextStepCta.href}
          >
            {lesson.nextStepCta.label}
          </a>
        </div>
      )}
    </div>
  );
}
