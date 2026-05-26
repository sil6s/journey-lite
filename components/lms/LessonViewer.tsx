"use client";

import { useEffect } from "react";
import { Lightbulb, AlertTriangle, Info, Calendar, Download, ExternalLink, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { PortableTextRenderer } from "@/app/components/PortableTextRenderer";
import { VideoEmbed } from "./VideoEmbed";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { updateLastViewed } from "@/lib/lms/actions";
import { InteractiveComponentRenderer, KnowledgeCheck } from "./InteractiveRegistry";
import type { SanityLesson, SanityLessonContentBlock } from "@/src/lib/sanity/lms-types";
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

const blockCalloutStyles = {
  info: calloutStyles.note,
  tip: calloutStyles.tip,
  warning: calloutStyles.warning,
  success: { bg: "bg-[#ecfdf3] border-[#bbf7d0]", icon: <CheckCircle2 className="h-5 w-5 text-[#15803d]" />, titleColor: "text-[#166534]" },
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

function LessonContentBlocks({
  blocks,
  courseSlug,
  lesson,
}: {
  blocks: SanityLessonContentBlock[];
  courseSlug: string;
  lesson: SanityLesson;
}) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <LessonContentBlock
          block={block}
          courseSlug={courseSlug}
          key={block._key ?? `${block.type}-${index}`}
          lesson={lesson}
        />
      ))}
    </div>
  );
}

function LessonContentBlock({
  block,
  courseSlug,
  lesson,
}: {
  block: SanityLessonContentBlock;
  courseSlug: string;
  lesson: SanityLesson;
}) {
  switch (block.type) {
    case "paragraph":
    case "richText":
      return <HtmlParagraph html={block.html} />;
    case "bulletList":
      return <HtmlList block={block} ordered={false} />;
    case "numberedList":
      return <HtmlList block={block} ordered />;
    case "callout": {
      const style = blockCalloutStyles[block.tone ?? "info"] ?? blockCalloutStyles.info;
      return (
        <aside className={`flex gap-3 rounded-xl border p-4 ${style.bg}`} role="note">
          <span className="mt-0.5 shrink-0">{style.icon}</span>
          <div>
            {block.title ? <p className={`text-sm font-semibold ${style.titleColor}`}>{block.title}</p> : null}
            {block.html ? <HtmlText className="mt-1 text-sm leading-6 text-[#53635b]" html={block.html} /> : null}
          </div>
        </aside>
      );
    }
    case "image":
      return <ImageBlock block={block} />;
    case "linkCard":
      return <LinkCardBlock block={block} />;
    case "comparisonTable":
      return <ComparisonTableBlock block={block} />;
    case "interactiveActivity":
      return lesson.interactiveComponent ? (
        <InteractiveComponentRenderer
          component={lesson.interactiveComponent}
          courseSlug={courseSlug}
          lessonSlug={lesson.slug}
        />
      ) : null;
    case "knowledgeCheck":
      return lesson.quiz ? <KnowledgeCheck quiz={lesson.quiz} courseSlug={courseSlug} lessonSlug={lesson.slug} /> : null;
    default:
      return null;
  }
}

function HtmlParagraph({ html }: { html?: string | null }) {
  if (!html) return null;
  return <HtmlText className="text-base leading-7 text-[#53635b]" html={html} />;
}

function HtmlText({ html, className }: { html: string; className?: string }) {
  return <p className={className} dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(html) }} />;
}

function HtmlList({
  block,
  ordered,
}: {
  block: Extract<SanityLessonContentBlock, { type: "bulletList" | "numberedList" }>;
  ordered: boolean;
}) {
  const items = block.items?.filter((item) => item.html) ?? [];
  if (!items.length) return null;
  const ListTag = ordered ? "ol" : "ul";
  return (
    <section>
      {block.title ? <h2 className="mb-3 text-xl font-semibold text-[#1f2c25]">{block.title}</h2> : null}
      <ListTag className={`${ordered ? "list-decimal" : "list-disc"} space-y-2 pl-6 text-base leading-7 text-[#53635b]`}>
        {items.map((item, index) => (
          <li dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(item.html ?? "") }} key={item._key ?? index} />
        ))}
      </ListTag>
    </section>
  );
}

function ImageBlock({ block }: { block: Extract<SanityLessonContentBlock, { type: "image" }> }) {
  if (!block.imageUrl) return null;
  return (
    <figure className="overflow-hidden rounded-xl border border-[#dce4df] bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={block.altText ?? block.title ?? "JourneyLite education image"} className="h-auto w-full object-contain" src={block.imageUrl} />
      {block.caption ? (
        <figcaption className="border-t border-[#edf1ee] px-4 py-2 text-xs text-[#66756d]">{block.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function LinkCardBlock({ block }: { block: Extract<SanityLessonContentBlock, { type: "linkCard" }> }) {
  if (!block.url || !block.title) return null;
  const external = block.url.startsWith("http");
  return (
    <a
      className="flex items-start gap-3 rounded-xl border border-[#c8ddd4] bg-white p-4 text-[#1f2c25] transition hover:border-[#145c42] hover:bg-[#f7faf8]"
      href={block.url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf8f2] text-[#145c42]">
        <LinkIcon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{block.title}</span>
        {block.description ? <span className="mt-1 block text-sm leading-6 text-[#53635b]">{block.description}</span> : null}
      </span>
      {external ? <ExternalLink className="ml-auto mt-1 h-4 w-4 shrink-0 text-[#8fa09a]" /> : null}
    </a>
  );
}

function ComparisonTableBlock({ block }: { block: Extract<SanityLessonContentBlock, { type: "comparisonTable" }> }) {
  const rows = normalizeTableRows(block.rows);
  if (!block.columns?.length || !rows.length) return null;
  return (
    <section>
      {block.title ? <h2 className="mb-3 text-xl font-semibold text-[#1f2c25]">{block.title}</h2> : null}
      <div className="overflow-x-auto rounded-xl border border-[#dce4df] bg-white">
        <table className="min-w-full divide-y divide-[#edf1ee] text-left text-sm">
          <thead className="bg-[#f7faf8] text-[#1f2c25]">
            <tr>
              {block.columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1ee] text-[#53635b]">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="px-4 py-3 align-top leading-6" key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function normalizeTableRows(rows: Extract<SanityLessonContentBlock, { type: "comparisonTable" }>["rows"]) {
  return (rows ?? []).map((row) => Array.isArray(row) ? row : row.cells ?? []);
}

function sanitizeBlockHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+="[^"]*"/gi, "")
    .replace(/\son[a-z]+='[^']*'/gi, "")
    .replace(/<(?!\/?(strong|b|em|i|u|a)(\s|>|\/))/gi, "&lt;")
    .replace(/href=["'](?!https?:\/\/|\/|mailto:|tel:)[^"']*["']/gi, "");
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
  const hasContentBlocks = Boolean(lesson.contentBlocks?.length);

  return (
    <div className="space-y-8">
      {/* Video */}
      {lesson.videoUrl && <VideoEmbed url={lesson.videoUrl} />}

      {/* Media images */}
      {!hasContentBlocks && media.length > 0 && (
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

      {hasContentBlocks ? (
        <LessonContentBlocks
          blocks={lesson.contentBlocks ?? []}
          courseSlug={courseSlug}
          lesson={lesson}
        />
      ) : null}

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

      {/* contentSections — rendered as clean flowing prose; headings only shown if explicitly set in Sanity */}
      {!hasContentBlocks && lesson.contentSections && lesson.contentSections.length > 0 && (
        <div className="space-y-4">
          {lesson.contentSections.map((section) => (
            <div key={section._key}>
              {section.body && section.body.length > 0 && (
                <ContentBody lines={section.body} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sanity Portable Text body */}
      {!hasContentBlocks && lesson.body && lesson.body.length > 0 && (
        <article className="max-w-none">
          <PortableTextRenderer value={lesson.body as never} />
        </article>
      )}

      {/* Interactive component */}
      {!hasContentBlocks && lesson.interactiveComponent && (
        <InteractiveComponentRenderer
          component={lesson.interactiveComponent}
          courseSlug={courseSlug}
          lessonSlug={lesson.slug}
        />
      )}

      {/* Quiz */}
      {!hasContentBlocks && lesson.quiz && (
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
