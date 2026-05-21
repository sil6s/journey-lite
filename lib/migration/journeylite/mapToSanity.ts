import type { NormalizedPost } from "./normalizePost";

// Portable Text types aligned with the blogPost Sanity schema
export interface PTSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

export interface PTLink {
  _type: "link";
  _key: string;
  href: string;
}

export interface PTBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: PTLink[];
  children: PTSpan[];
}

export interface PTImage {
  _type: "image";
  _key: string;
  asset: { _type: "reference"; _ref: string };
  alt: string;
  // _ref will be filled after Sanity asset upload
}

export interface PTCallout {
  _type: "callout";
  _key: string;
  title: string;
  text: string;
}

export type PTBlock_t = PTBlock | PTImage | PTCallout;

export interface SanityBlogPostDraft {
  _type: "blogPost";
  _id?: string;
  title: string;
  slug: { _type: "slug"; current: string };
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  body: PTBlock_t[];
  // Migration metadata stored as JSON string in a hidden field
  // (extend Sanity schema with a "migration" object field to persist these)
  _migration?: {
    source: "journeylite-wordpress";
    sourceUrl: string;
    oldSlug: string;
    migratedAt: string;
    needsReview: boolean;
    medicalReviewRecommended: boolean;
    notes: string[];
    authorName: string;
    categoryNames: string[];
    featuredImageUrl: string;
    featuredImageAlt: string;
  };
}

let keyCounter = 0;
function key(): string {
  return `k${(++keyCounter).toString(36).padStart(6, "0")}`;
}

function span(text: string, marks: string[] = []): PTSpan {
  return { _type: "span", _key: key(), text, marks };
}

function block(
  style: PTBlock["style"],
  children: PTSpan[],
  markDefs: PTLink[] = [],
  listItem?: PTBlock["listItem"],
  level?: number
): PTBlock {
  return { _type: "block", _key: key(), style, markDefs, children, ...(listItem ? { listItem, level: level ?? 1 } : {}) };
}

// Very lightweight Markdown → Portable Text converter.
// Handles: headings, paragraphs, bold, italic, inline links, bullet/numbered lists.
// Images in Markdown are noted but need asset IDs from Sanity upload — stored as placeholder callouts.
export function markdownToPortableText(markdown: string): PTBlock_t[] {
  const lines = markdown.split("\n");
  const blocks: PTBlock_t[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const style: PTBlock["style"] = level <= 2 ? "h2" : "h3";
      blocks.push(block(style, parseInline(text).children, parseInline(text).markDefs));
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const text = line.slice(2);
      const parsed = parseInline(text);
      blocks.push(block("blockquote", parsed.children, parsed.markDefs));
      i++;
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^[\*\-]\s+(.+)/);
    if (bulletMatch) {
      const parsed = parseInline(bulletMatch[1]);
      blocks.push(block("normal", parsed.children, parsed.markDefs, "bullet", 1));
      i++;
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^\d+\.\s+(.+)/);
    if (numMatch) {
      const parsed = parseInline(numMatch[1]);
      blocks.push(block("normal", parsed.children, parsed.markDefs, "number", 1));
      i++;
      continue;
    }

    // Inline image — store as callout placeholder (will be replaced with real image after upload)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      blocks.push({
        _type: "callout",
        _key: key(),
        title: "Image (pending upload)",
        text: `src: ${src}\nalt: ${alt || "(no alt text)"}`,
      } as PTCallout);
      i++;
      continue;
    }

    // Horizontal rule / separator
    if (/^[-*_]{3,}$/.test(line.trim())) {
      i++;
      continue;
    }

    // Empty line — skip
    if (!line.trim()) {
      i++;
      continue;
    }

    // Normal paragraph
    const parsed = parseInline(line.trim());
    if (parsed.children.length > 0) {
      blocks.push(block("normal", parsed.children, parsed.markDefs));
    }
    i++;
  }

  return blocks;
}

interface ParsedInline {
  children: PTSpan[];
  markDefs: PTLink[];
}

function parseInline(text: string): ParsedInline {
  const children: PTSpan[] = [];
  const markDefs: PTLink[] = [];

  // Tokenise: bold, italic, links
  // Pattern: **bold**, *italic*, [text](url)
  const TOKEN_RE = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    // Text before token
    if (match.index > lastIndex) {
      children.push(span(text.slice(lastIndex, match.index)));
    }

    if (match[0].startsWith("**")) {
      children.push(span(match[2], ["strong"]));
    } else if (match[0].startsWith("*")) {
      children.push(span(match[3], ["em"]));
    } else {
      // Link
      const linkKey = key();
      const href = match[5];
      markDefs.push({ _type: "link", _key: linkKey, href });
      children.push(span(match[4], [linkKey]));
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    children.push(span(text.slice(lastIndex)));
  }

  // Remove empty spans
  return {
    children: children.filter((s) => s.text !== ""),
    markDefs,
  };
}

export function mapToSanityDraft(post: NormalizedPost): SanityBlogPostDraft {
  const body = markdownToPortableText(post.bodyMarkdown);

  return {
    _type: "blogPost",
    title: post.title,
    slug: { _type: "slug", current: post.slug },
    excerpt: post.excerpt.slice(0, 220),
    publishedAt: post.publishedAt || new Date().toISOString(),
    ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),
    ...(post.seoTitle ? { seoTitle: post.seoTitle } : {}),
    ...(post.metaDescription ? { seoDescription: post.metaDescription } : {}),
    ...(post.tags.length > 0 ? { tags: post.tags } : {}),
    body,
    _migration: {
      source: "journeylite-wordpress",
      sourceUrl: post.sourceUrl,
      oldSlug: post.oldSlug,
      migratedAt: new Date().toISOString(),
      needsReview: post.needsReview,
      medicalReviewRecommended: post.medicalReviewRecommended,
      notes: post.migrationNotes,
      authorName: post.author,
      categoryNames: post.categories,
      featuredImageUrl: post.featuredImageUrl,
      featuredImageAlt: post.featuredImageAlt,
    },
  };
}
