export type SeoScoreInput = {
  url?: string;
  title?: string;
  description?: string;
  h1Texts?: string[];
  h2Count?: number;
  firstParagraph?: string;
  bodyText?: string;
  focusKeyword?: string;
  imageCount?: number;
  imagesWithAlt?: number;
  internalLinks?: number;
  externalLinks?: number;
  canonicalUrl?: string;
  robots?: string;
  viewportPresent?: boolean;
  structuredData?: boolean;
  statusCode?: number;
  https?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  brokenLinks?: number;
};

export type SeoCheck = {
  label: string;
  points: number;
  passed: boolean;
  severity: "error" | "warning" | "passed";
  detail: string;
};

export type SeoScoreResult = {
  score: number;
  label: "Excellent" | "Good" | "Needs improvement" | "Poor";
  errors: SeoCheck[];
  warnings: SeoCheck[];
  passed: SeoCheck[];
  keywordDensity: number;
  wordCount: number;
};

const closeKeyword = (text: string | undefined, keyword: string | undefined) => {
  if (!text || !keyword) return false;
  const normalizedText = text.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase().trim();
  if (!normalizedKeyword) return false;
  if (normalizedText.includes(normalizedKeyword)) return true;
  return normalizedKeyword.split(/\s+/).filter(Boolean).some((part) => part.length > 3 && normalizedText.includes(part));
};

const countWords = (text = "") => text.trim().split(/\s+/).filter(Boolean).length;

const keywordUses = (text: string, keyword: string | undefined) => {
  if (!keyword?.trim()) return 0;
  const escaped = keyword.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.toLowerCase().match(new RegExp(`\\b${escaped}\\b`, "g")) ?? []).length;
};

export function scoreSeo(input: SeoScoreInput): SeoScoreResult {
  const bodyText = input.bodyText ?? "";
  const wordCount = countWords(bodyText);
  const keywordDensity = wordCount ? (keywordUses(bodyText, input.focusKeyword) / wordCount) * 100 : 0;
  const h1Count = input.h1Texts?.filter(Boolean).length ?? 0;
  const urlPath = input.url ? input.url.replace(/^https?:\/\/[^/]+/i, "") : "";
  const imagesWithAltRatio = input.imageCount ? (input.imagesWithAlt ?? 0) / input.imageCount : 1;

  const checks: SeoCheck[] = [
    check("Title tag exists", 8, Boolean(input.title), "Missing title tag is a critical search and sharing issue."),
    check("Title length", 5, Boolean(input.title && input.title.length >= 30 && input.title.length <= 60), "Aim for 30 to 60 characters."),
    check("Primary keyword in title", 5, closeKeyword(input.title, input.focusKeyword), "Use the primary keyword or a close variation."),
    check("Meta description exists", 5, Boolean(input.description), "Add a clear meta description."),
    check("Meta description length", 4, Boolean(input.description && input.description.length >= 120 && input.description.length <= 160), "Aim for 120 to 160 characters."),
    check("Primary keyword in description", 2, closeKeyword(input.description, input.focusKeyword), "Use the primary keyword naturally."),
    check("H1 exists", 5, h1Count > 0, "Each content page needs a visible H1."),
    check("H1 count", 2, h1Count === 1, "Prefer one primary H1."),
    check("Primary keyword in H1", 4, input.h1Texts?.some((h1) => closeKeyword(h1, input.focusKeyword)) ?? false, "Use the primary keyword in the main heading when natural."),
    check("H2 headings exist", 3, (input.h2Count ?? 0) > 0 || wordCount < 500, "Substantial pages should include H2 headings."),
    check("Primary keyword in first paragraph", 3, closeKeyword(input.firstParagraph, input.focusKeyword), "Mention the topic early."),
    check("Word count", 5, wordCount >= 300, "Content pages should usually have at least 300 words."),
    check("Keyword density", 3, !input.focusKeyword || (keywordDensity >= 0.5 && keywordDensity <= 2.5), "Treat density as a light warning only."),
    check("Images have alt text", 5, imagesWithAltRatio >= 0.9, "At least 90% of relevant images should have alt text."),
    check("Internal links", 5, (input.internalLinks ?? 0) >= 2, "Add at least two relevant internal links."),
    check("External links", 2, (input.externalLinks ?? 0) >= 1, "Add an external source when relevant."),
    check("Canonical tag exists", 5, Boolean(input.canonicalUrl), "Set a valid canonical URL."),
    check("Meta robots", 5, !input.robots?.includes("noindex"), "Make accidental noindex highly visible."),
    check("URL length", 2, !urlPath || urlPath.length < 100, "Keep URLs under 100 characters."),
    check("URL readability", 2, !/[?&=]|[a-f0-9]{16,}/i.test(urlPath), "Avoid long IDs and unnecessary parameters."),
    check("Primary keyword in URL", 2, closeKeyword(urlPath.replace(/-/g, " "), input.focusKeyword), "Optional positive signal."),
    check("HTTPS", 3, input.https !== false, "Production pages should use HTTPS."),
    check("Mobile viewport tag", 3, input.viewportPresent !== false, "Next.js includes a viewport tag by default."),
    check("Structured data", 3, Boolean(input.structuredData), "Use schema where applicable."),
    check("Broken links", 5, (input.brokenLinks ?? 0) === 0, "Fix broken internal links."),
    check("Page status", 4, !input.statusCode || input.statusCode === 200, "Public pages should return HTTP 200."),
    check("Open Graph title", 2, Boolean(input.ogTitle), "Add an OG title."),
    check("Open Graph description", 1, Boolean(input.ogDescription), "Add an OG description."),
    check("Open Graph image", 1, Boolean(input.ogImage), "Add an OG image."),
  ];

  const score = checks.reduce((sum, item) => sum + (item.passed ? item.points : 0), 0);
  const classified = checks.map((item) => ({
    ...item,
    severity: item.passed ? "passed" as const : item.points >= 5 || item.label === "Meta robots" ? "error" as const : "warning" as const,
  }));

  return {
    score,
    label: score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 60 ? "Needs improvement" : "Poor",
    errors: classified.filter((item) => item.severity === "error"),
    warnings: classified.filter((item) => item.severity === "warning"),
    passed: classified.filter((item) => item.severity === "passed"),
    keywordDensity,
    wordCount,
  };
}

function check(label: string, points: number, passed: boolean, detail: string): SeoCheck {
  return { label, points, passed, severity: passed ? "passed" : "warning", detail };
}
