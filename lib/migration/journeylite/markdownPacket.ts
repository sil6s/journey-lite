import type { NormalizedPost } from "./normalizePost";

export function buildMarkdownPacket(post: NormalizedPost): string {
  const tags = post.tags.map((t) => `- ${t}`).join("\n") || "- (none)";
  const internalLinks = post.internalLinks.map((l) => `- [${l.text}](${l.url})`).join("\n") || "- (none)";
  const externalLinks = post.externalLinks.map((l) => `- [${l.text}](${l.url})`).join("\n") || "- (none)";
  const migrationNotes = post.migrationNotes.map((n) => `- ${n}`).join("\n") || "- (none)";
  const featuredImage = post.featuredImageUrl || "(none)";
  const featuredImageAlt = post.featuredImageAlt || post.migrationNotes.some((n) => n.includes("Featured image"))
    ? `${post.title} — JourneyLite`
    : "(none)";

  return `## Content Mode
migrated

## Source URL
${post.sourceUrl}

## Canonical URL
${post.canonicalUrl}

## Original Slug
${post.oldSlug}

## Title
${post.title}

## Slug
${post.slug}

## Resource Type
${post.resourceType}

## Category
${post.categories[0] || "Uncategorized"}

## Tags
${tags}

## Original Author
${post.author}

## Author
${post.author}

## Reviewed By


## Published At
${post.publishedAt}

## Original Published At
${post.publishedAt}

## Updated At
${post.updatedAt || ""}

## SEO Focus Keyword


## Meta Title
${post.seoTitle || post.title}

## Meta Description
${post.metaDescription || post.excerpt}

## Excerpt
${post.excerpt}

## Featured Image
${featuredImage}

## Featured Image Alt Text
${featuredImageAlt}

## Internal Links
${internalLinks}

## External Sources
${externalLinks}

## Migration Notes
${migrationNotes}

## Needs Review
${post.needsReview}

## Medical Review Recommended
${post.medicalReviewRecommended}

## Body
${post.bodyMarkdown}
`;
}
