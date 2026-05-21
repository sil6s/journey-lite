import { z } from "zod";
import type { NormalizedPost } from "./normalizePost";

const ResourceTypeSchema = z.enum([
  "education",
  "patient-story",
  "news",
  "announcement",
  "recipe",
  "faq",
  "other",
]);

export const NormalizedPostSchema = z.object({
  sourceUrl: z.string().url(),
  canonicalUrl: z.string(),
  oldSlug: z.string(),
  slug: z.string().min(1),
  title: z.string().min(1),
  seoTitle: z.string(),
  metaDescription: z.string(),
  excerpt: z.string(),
  publishedAt: z.string().min(1),
  updatedAt: z.string(),
  author: z.string(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  featuredImageUrl: z.string(),
  featuredImageAlt: z.string(),
  inlineImages: z.array(
    z.object({ src: z.string(), alt: z.string(), caption: z.string() })
  ),
  bodyHtml: z.string(),
  bodyMarkdown: z.string().min(1),
  internalLinks: z.array(z.object({ text: z.string(), url: z.string() })),
  externalLinks: z.array(z.object({ text: z.string(), url: z.string() })),
  ctaLinks: z.array(z.object({ text: z.string(), url: z.string() })),
  resourceType: ResourceTypeSchema,
  wordCount: z.number(),
  readingTime: z.number(),
  needsReview: z.boolean(),
  medicalReviewRecommended: z.boolean(),
  migrationNotes: z.array(z.string()),
});

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validatePost(post: NormalizedPost): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const result = NormalizedPostSchema.safeParse(post);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${issue.path.join(".")}: ${issue.message}`);
    }
  }

  // Soft warnings
  if (!post.author) warnings.push("Author is blank");
  if (!post.featuredImageUrl) warnings.push("No featured image");
  if (!post.metaDescription) warnings.push("No meta description");
  if (post.categories.length === 0) warnings.push("No categories");
  if (post.tags.length === 0) warnings.push("No tags");
  if (!post.featuredImageAlt && post.featuredImageUrl) {
    warnings.push("Featured image has no alt text");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
