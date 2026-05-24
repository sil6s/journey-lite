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

/**
 * Parses a single line of imported markdown-style text into JSX.
 * Handles **bold**, *italic*, `code`, and [link](url).
 */
function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index} className="font-semibold text-[#1f2c25]">{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
    else if (m[4]) parts.push(<code key={m.index} className="rounded bg-[#f1f5f9] px-1 py-0.5 font-mono text-sm">{m[4]}</code>);
    else if (m[6]) parts.push(
      <a key={m.index} href={m[6]} className="font-medium text-[#145c42] underline underline-offset-2 hover:text-[#0f4d37]"
        {...(m[6].startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {m[5] || readableLinkLabel(m[6])}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function readableLinkLabel(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("journeylite.com")) return "JourneyLite resource";
    if (parsed.hostname.includes("thechristhospital.com")) return "The Christ Hospital information";
    if (parsed.hostname.includes("mercy.com")) return "Jewish Hospital information";
    if (parsed.hostname.includes("mckesson.com")) return "Eliquis coupon";
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "Open resource";
  }
}

function normalizeImportedLine(raw: string) {
  return raw
    .trim()
    .replace(/^([*-]\s+){2,}/, "- ")
    .replace(/^\d+\.\s+\d+\.\s+/, "1. ")
    .replace(/^\*\s{2,}/, "- ")
    .replace(/^\*\s+/, "- ");
}

/**
 * Renders an array of strings (possibly markdown-styled) as structured prose.
 * Handles heading lines (# ## ###), list lines (- * 1.), and plain paragraphs.
 */
function ContentBody({ lines }: { lines: string[] }) {
  const nodes: React.ReactNode[] = [];
  const bullets: string[] = [];
  const ordered: string[] = [];
  let key = 0;

  function flushBullets() {
    if (bullets.length) {
      nodes.push(
        <ul key={key++} className="mt-4 list-disc space-y-1.5 pl-6 text-base leading-7 text-[#53635b]">
          {bullets.map((b, i) => <li key={i}><InlineMarkdown text={b} /></li>)}
        </ul>
      );
      bullets.length = 0;
    }
  }
  function flushOrdered() {
    if (ordered.length) {
      nodes.push(
        <ol key={key++} className="mt-4 list-decimal space-y-1.5 pl-6 text-base leading-7 text-[#53635b]">
          {ordered.map((b, i) => <li key={i}><InlineMarkdown text={b} /></li>)}
        </ol>
      );
      ordered.length = 0;
    }
  }

  for (const raw of lines) {
    const line = normalizeImportedLine(raw);
    if (!line) { flushBullets(); flushOrdered(); continue; }

    const h3 = line.match(/^###\s+(.*)/);
    const h2 = !h3 && line.match(/^##\s+(.*)/);
    const h1 = !h2 && line.match(/^#\s+(.*)/);
    const bullet = line.match(/^[-*]\s+(.*)/);
    const orderedItem = line.match(/^\d+\.\s+(.*)/);

    if (h1 || h2 || h3) {
      flushBullets(); flushOrdered();
      const text = (h1 || h2 || h3)![1];
      if (h3) nodes.push(<h4 key={key++} className="mt-6 mb-1 text-base font-semibold text-[#1f2c25]">{text}</h4>);
      else if (h2) nodes.push(<h3 key={key++} className="mt-8 mb-2 text-lg font-semibold text-[#1f2c25]">{text}</h3>);
      else nodes.push(<h2 key={key++} className="mt-10 mb-3 text-xl font-semibold text-[#1f2c25]">{text}</h2>);
    } else if (bullet) {
      flushOrdered();
      bullets.push(bullet[1]);
    } else if (orderedItem) {
      flushBullets();
      ordered.push(orderedItem[1]);
    } else {
      flushBullets(); flushOrdered();
      nodes.push(<p key={key++} className="mt-4 text-base leading-7 text-[#53635b]"><InlineMarkdown text={line} /></p>);
    }
  }
  flushBullets(); flushOrdered();
  return <>{nodes}</>;
}

export function LessonViewer({ lesson, courseSlug, moduleSlug, progress, isAuthenticated }: LessonViewerProps) {
  useEffect(() => {
    if (isAuthenticated) {
      updateLastViewed(courseSlug, moduleSlug, lesson.slug).catch(() => {});
    }
  }, [courseSlug, moduleSlug, lesson.slug, isAuthenticated]);

  // Deduplicate media by URL, skip items with no valid URL
  const seenUrls = new Set<string>();
  const media = (lesson.media ?? []).filter((m) => {
    const src = m.assetUrl ?? m.localPath ?? null;
    if (!src) return false;
    if (seenUrls.has(src)) return false;
    seenUrls.add(src);
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Video */}
      {lesson.videoUrl && <VideoEmbed url={lesson.videoUrl} />}

      {/* Media images */}
      {media.length > 0 && (
        <div className={`grid gap-4 ${media.length === 1 ? "" : "sm:grid-cols-2"}`}>
          {media.map((m) => {
            const src = m.assetUrl ?? m.localPath!;
            return (
              <figure className="overflow-hidden rounded-xl border border-[#dce4df] bg-white" key={m._id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={m.altText ?? m.title} className="h-auto w-full object-contain" src={src} />
                {(m.caption ?? m.title) && (
                  <figcaption className="border-t border-[#edf1ee] px-4 py-2 text-xs text-[#66756d]">
                    {m.caption ?? m.title}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}

      {/* Key takeaways */}
      {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
        <div className="rounded-2xl border border-[#c8ddd4] bg-[#f0f8f4] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#145c42]">Key Takeaways</p>
          <ul className="mt-3 space-y-2">
            {lesson.keyTakeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-[#355346]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#145c42]" />
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
          <div key={callout._key} className={`flex gap-3 rounded-xl border p-4 ${style.bg}`} role="note">
            <span className="mt-0.5 shrink-0">{style.icon}</span>
            <div>
              {callout.title && <p className={`text-sm font-semibold ${style.titleColor}`}>{callout.title}</p>}
              {callout.body && <p className="mt-1 text-sm leading-6 text-[#53635b]">{callout.body}</p>}
            </div>
          </div>
        );
      })}

      {/* contentSections — flowing prose, no per-section cards */}
      {lesson.contentSections && lesson.contentSections.length > 0 && (
        <div className="space-y-1">
          {lesson.contentSections.map((section) => (
            <div key={section._key}>
              {section.heading && (
                <h2 className="mt-8 mb-3 text-xl font-semibold text-[#1f2c25]">{section.heading}</h2>
              )}
              {section.body && section.body.length > 0 && (
                <ContentBody lines={section.body} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sanity Portable Text body */}
      {lesson.body && lesson.body.length > 0 && (
        <article className="max-w-none">
          <PortableTextRenderer value={lesson.body as never} />
        </article>
      )}

      {/* Interactive component */}
      {lesson.interactiveComponent && (
        <InteractiveComponentRenderer
          component={lesson.interactiveComponent}
          courseSlug={courseSlug}
          lessonSlug={lesson.slug}
        />
      )}

      {/* Quiz */}
      {lesson.quiz && (
        <KnowledgeCheck quiz={lesson.quiz} courseSlug={courseSlug} lessonSlug={lesson.slug} />
      )}

      {/* Evidence references */}
      {lesson.evidenceReferences && lesson.evidenceReferences.length > 0 && (
        <details className="rounded-2xl border border-[#dce4df] bg-white p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[#1f2c25]">
            Sources &amp; references
          </summary>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            {lesson.evidenceReferences.map((ref) => (
              <li key={ref._id}>
                {ref.url ? (
                  <a className="font-medium text-[#145c42] underline underline-offset-2 hover:text-[#0f4d37]"
                    href={ref.url} rel="noreferrer" target="_blank">
                    {ref.label}
                  </a>
                ) : (
                  <span className="font-medium text-[#1f2c25]">{ref.label}</span>
                )}
                {ref.use && <p className="mt-0.5 text-[#66756d]">{ref.use}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Downloads */}
      {lesson.downloads && lesson.downloads.length > 0 && (
        <div className="rounded-2xl border border-[#dce4df] bg-white p-5">
          <p className="text-sm font-semibold text-[#1f2c25]">Downloads</p>
          <ul className="mt-3 space-y-2">
            {lesson.downloads.map((dl) => (
              <li key={dl._id}>
                {dl.fileUrl ? (
                  <a className="flex items-center gap-3 rounded-lg border border-[#dce4df] p-3 text-sm text-[#1f2c25] transition hover:border-[#145c42] hover:bg-[#f5f8f6]"
                    download href={dl.fileUrl} rel="noopener noreferrer" target="_blank">
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

      {/* Safety footer */}
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
          <a className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3e2e] transition hover:bg-[#edf4ef]"
            href={lesson.nextStepCta.href}>
            {lesson.nextStepCta.label}
          </a>
        </div>
      )}
    </div>
  );
}
