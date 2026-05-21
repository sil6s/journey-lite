import slugify from "slugify";
import type { RawExtractedPost } from "./extractPost";

export type ResourceType =
  | "education"
  | "patient-story"
  | "news"
  | "announcement"
  | "recipe"
  | "faq"
  | "other";

export interface NormalizedPost {
  sourceUrl: string;
  canonicalUrl: string;
  oldSlug: string;
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  categories: string[];
  tags: string[];
  featuredImageUrl: string;
  featuredImageAlt: string;
  inlineImages: Array<{ src: string; alt: string; caption: string }>;
  bodyHtml: string;
  bodyMarkdown: string;
  internalLinks: Array<{ text: string; url: string }>;
  externalLinks: Array<{ text: string; url: string }>;
  ctaLinks: Array<{ text: string; url: string }>;
  resourceType: ResourceType;
  wordCount: number;
  readingTime: number;
  needsReview: boolean;
  medicalReviewRecommended: boolean;
  migrationNotes: string[];
}

// ---------- Category normalization ----------
const CATEGORY_MAP: Record<string, string> = {
  anouncements: "Announcements",
  announcement: "Announcements",
  announcements: "Announcements",
  education: "Education",
  "home page": "Homepage Feature",
  homepage: "Homepage Feature",
  "patient stories": "Patient Stories",
  "patient story": "Patient Stories",
  "success stories": "Patient Stories",
  "success story": "Patient Stories",
  recipes: "Nutrition & Lifestyle",
  recipe: "Nutrition & Lifestyle",
  "nutrition & lifestyle": "Nutrition & Lifestyle",
  "nutrition and lifestyle": "Nutrition & Lifestyle",
  news: "News",
  "weight loss medications": "Weight Loss Medications",
  medications: "Weight Loss Medications",
  "bariatric surgery": "Bariatric Surgery",
  "gastric sleeve": "Gastric Sleeve",
  "gastric bypass": "Gastric Bypass",
  "gastric balloon": "Gastric Balloon",
  "pricing & financing": "Pricing & Financing",
  "pricing and financing": "Pricing & Financing",
  faq: "FAQ",
  faqs: "FAQ",
  uncategorized: "Uncategorized",
};

function normalizeCategory(raw: string): string {
  const key = raw.toLowerCase().trim();
  return CATEGORY_MAP[key] || raw.trim() || "Uncategorized";
}

// ---------- Resource type detection ----------
const PATIENT_STORY_PATTERNS = [
  /success story/i,
  /patient story/i,
  /before and after/i,
  /before\/after/i,
  /vsg success/i,
  /my journey/i,
  /lost \d+ pounds/i,
  /weight loss journey/i,
  /transformation/i,
];

const RECIPE_PATTERNS = [/recipe/i, /meal plan/i, /bariatric recipe/i, /post-op recipe/i, /ingredients/i, /nutrition facts/i];

const FAQ_PATTERNS = [/frequently asked/i, /\bfaq\b/i];

const ANNOUNCEMENT_PATTERNS = [/announcing/i, /introducing/i, /now open/i, /new location/i, /grand opening/i, /holiday/i, /closing/i];

const MEDICAL_FLAG_PATTERNS = [
  /bariatric surgery risk/i,
  /medication dosing/i,
  /glp-1/i,
  /wegovy/i,
  /ozempic/i,
  /zepbound/i,
  /phentermine/i,
  /compounded/i,
  /insurance/i,
  /weight loss percentage/i,
  /surgical revision/i,
  /before.{0,10}after/i,
  /nutrition.{0,20}after surgery/i,
];

function detectResourceType(title: string, body: string): ResourceType {
  const text = `${title} ${body}`;
  if (PATIENT_STORY_PATTERNS.some((p) => p.test(text))) return "patient-story";
  if (RECIPE_PATTERNS.some((p) => p.test(text))) return "recipe";
  if (FAQ_PATTERNS.some((p) => p.test(text))) return "faq";
  if (ANNOUNCEMENT_PATTERNS.some((p) => p.test(text))) return "announcement";
  if (/education|guide|what is|how to|compare|vs\.|understanding|overview/i.test(text)) return "education";
  return "other";
}

function isMedicalReviewNeeded(title: string, body: string): boolean {
  const text = `${title} ${body}`;
  return MEDICAL_FLAG_PATTERNS.some((p) => p.test(text));
}

function makeSlug(raw: string, title: string): string {
  if (raw) {
    return slugify(raw, { lower: true, strict: true });
  }
  return slugify(title, { lower: true, strict: true });
}

function extractExcerpt(bodyMarkdown: string, metaDescription: string): string {
  if (metaDescription) return metaDescription.slice(0, 220);
  const firstPara = bodyMarkdown
    .split("\n")
    .find((line) => line.trim() && !line.startsWith("#") && !line.startsWith("!"));
  return (firstPara || "").replace(/[*_`]/g, "").slice(0, 220);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function normalizePost(raw: RawExtractedPost, bodyMarkdown: string): NormalizedPost {
  const notes: string[] = [];
  let needsReview = false;

  const title = raw.title.trim();
  if (!title) {
    notes.push("Title is missing");
    needsReview = true;
  }

  const slug = makeSlug(raw.oldSlug, title);

  const publishedAt = raw.publishedAt || "";
  if (!publishedAt) {
    notes.push("Publish date is missing");
    needsReview = true;
  }

  const author = raw.author.trim();
  if (!author) {
    notes.push("Author is missing");
    needsReview = true;
  }

  const categories = raw.categories.length > 0
    ? raw.categories.map(normalizeCategory)
    : ["Uncategorized"];
  if (raw.categories.length === 0) {
    notes.push("Category is missing — set to Uncategorized");
    needsReview = true;
  }

  const tags = raw.tags.map((t) => t.trim()).filter(Boolean);

  if (!raw.featuredImageUrl) {
    notes.push("Featured image missing");
    needsReview = true;
  }
  if (!raw.metaDescription) {
    notes.push("Meta description missing — excerpt used as suggestion");
  }

  const wordCount = countWords(bodyMarkdown);
  if (wordCount < 150) {
    notes.push(`Body is short (${wordCount} words) — review content`);
    needsReview = true;
  }
  if (!bodyMarkdown.trim()) {
    notes.push("No body content extracted");
    needsReview = true;
  }

  const resourceType = detectResourceType(title, bodyMarkdown);
  if (resourceType === "other") needsReview = true;

  const medicalReviewRecommended = isMedicalReviewNeeded(title, bodyMarkdown);
  if (medicalReviewRecommended) {
    notes.push("Contains medical/medication content — medical review recommended");
  }

  // Check for before/after images
  if (/before.{0,10}after/i.test(`${title} ${bodyMarkdown}`)) {
    notes.push("Contains before/after references — check images for sensitive content");
    needsReview = true;
  }

  const excerpt = extractExcerpt(bodyMarkdown, raw.metaDescription);

  return {
    sourceUrl: raw.sourceUrl,
    canonicalUrl: raw.canonicalUrl,
    oldSlug: raw.oldSlug,
    slug,
    title,
    seoTitle: raw.seoTitle,
    metaDescription: raw.metaDescription,
    excerpt,
    publishedAt,
    updatedAt: raw.updatedAt,
    author,
    categories,
    tags,
    featuredImageUrl: raw.featuredImageUrl,
    featuredImageAlt: raw.featuredImageAlt,
    inlineImages: raw.inlineImages,
    bodyHtml: raw.bodyHtml,
    bodyMarkdown,
    internalLinks: raw.internalLinks,
    externalLinks: raw.externalLinks,
    ctaLinks: raw.ctaLinks,
    resourceType,
    wordCount,
    readingTime: Math.ceil(wordCount / 200),
    needsReview,
    medicalReviewRecommended,
    migrationNotes: notes,
  };
}
