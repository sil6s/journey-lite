import * as cheerio from "cheerio";

export interface RawExtractedPost {
  sourceUrl: string;
  canonicalUrl: string;
  oldSlug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  categories: string[];
  tags: string[];
  featuredImageUrl: string;
  featuredImageAlt: string;
  inlineImages: Array<{ src: string; alt: string; caption: string }>;
  bodyHtml: string;
  internalLinks: Array<{ text: string; url: string }>;
  externalLinks: Array<{ text: string; url: string }>;
  ctaLinks: Array<{ text: string; url: string }>;
  rawHtml: string;
}

const SITE_ORIGIN = "https://journeylite.com";
const INTERNAL_PATTERNS = [/journeylite\.com/];
const SKIP_URL_PATTERNS = [
  /\/wp-login/,
  /\/wp-admin/,
  /\/cart/,
  /\/checkout/,
  /\/account/,
  /\/appointment/,
  /\/schedule/,
  /\/shop/,
  /\/location/,
  /\?/,
];

function isInternal(url: string): boolean {
  try {
    const abs = url.startsWith("http") ? url : `${SITE_ORIGIN}${url}`;
    return INTERNAL_PATTERNS.some((p) => p.test(abs));
  } catch {
    return false;
  }
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

export function extractPost(html: string, sourceUrl: string): RawExtractedPost {
  const $ = cheerio.load(html);

  // --- Remove page chrome ---
  $(
    "header, footer, nav, .sidebar, .widget, .wp-block-group.is-layout-flow:has(.wp-block-navigation), " +
      ".comments-area, .comment-respond, .sharedaddy, .jp-relatedposts, " +
      ".cookie-consent, #cookie-law-info-bar, .cookie-notice, " +
      ".woocommerce-breadcrumb, .breadcrumb, .site-header, .site-footer, " +
      ".search-form, .wp-search, .navigation.post-navigation, " +
      "script, style, noscript, iframe[src*='ads'], .adsbygoogle"
  ).remove();

  // --- Canonical & slug ---
  const canonicalHref = $('link[rel="canonical"]').attr("href") || sourceUrl;
  let oldSlug = "";
  try {
    const u = new URL(canonicalHref);
    const parts = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    oldSlug = parts[parts.length - 1] || "";
  } catch {
    oldSlug = sourceUrl.split("/").filter(Boolean).pop() || "";
  }

  // --- SEO meta ---
  const seoTitle =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().replace(/\s*[-|].*$/, "").trim() ||
    "";
  const metaDescription =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  // --- Title ---
  const title =
    $("h1.entry-title, h1.post-title, h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    "";

  // --- Dates ---
  const publishedAt =
    $("time.entry-date").attr("datetime") ||
    $('meta[property="article:published_time"]').attr("content") ||
    $("time[datetime]").first().attr("datetime") ||
    "";
  const updatedAt =
    $('meta[property="article:modified_time"]').attr("content") ||
    $(".updated").attr("datetime") ||
    "";

  // --- Author ---
  const author =
    $(".author-name, .entry-author-name, span.author, a[rel='author']").first().text().trim() ||
    $('meta[name="author"]').attr("content") ||
    $('meta[property="article:author"]').attr("content") ||
    "";

  // --- Categories & tags ---
  const categories: string[] = [];
  $(".cat-links a, .category-links a, a[rel='category tag']").each((_, el) => {
    const text = $(el).text().trim();
    if (text) categories.push(text);
  });

  const tags: string[] = [];
  $(".tags-links a, .tag-links a, a[rel='tag']").each((_, el) => {
    const text = $(el).text().trim();
    if (text) tags.push(text);
  });

  // --- Featured image ---
  let featuredImageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $(".post-thumbnail img, .featured-image img").first().attr("src") ||
    "";
  if (featuredImageUrl && !featuredImageUrl.startsWith("http")) {
    featuredImageUrl = resolveUrl(featuredImageUrl, sourceUrl);
  }
  const featuredImageAlt =
    $(".post-thumbnail img, .featured-image img").first().attr("alt") || "";

  // --- Extract article body ---
  let $article = $("article .entry-content, article .post-content, .entry-content, .post-content, main article");
  if ($article.length === 0) {
    $article = $("main, .content-area");
  }

  // Remove nested nav/sidebar inside article
  $article.find("nav, .sidebar, .widget, .sharedaddy, .jp-relatedposts").remove();
  // Remove shortcode leftovers
  $article.find("[class*='shortcode']").remove();

  // --- Inline images ---
  const inlineImages: Array<{ src: string; alt: string; caption: string }> = [];
  $article.find("img").each((_, el) => {
    const rawSrc = $(el).attr("src") || "";
    const src = rawSrc.startsWith("http") ? rawSrc : resolveUrl(rawSrc, sourceUrl);
    const alt = $(el).attr("alt") || "";
    const caption = $(el).closest("figure").find("figcaption").text().trim() || "";
    if (src) inlineImages.push({ src, alt, caption });
  });

  // --- Links ---
  const internalLinks: Array<{ text: string; url: string }> = [];
  const externalLinks: Array<{ text: string; url: string }> = [];
  const ctaLinks: Array<{ text: string; url: string }> = [];

  $article.find("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const resolved = resolveUrl(href, sourceUrl);
    const text = $(el).text().trim().slice(0, 200);
    const isBtn =
      $(el).hasClass("wp-block-button__link") ||
      $(el).hasClass("btn") ||
      $(el).hasClass("button") ||
      $(el).closest(".wp-block-button, .cta-button, .call-to-action").length > 0;

    if (isBtn) {
      ctaLinks.push({ text, url: resolved });
    } else if (isInternal(resolved)) {
      internalLinks.push({ text, url: resolved });
    } else {
      externalLinks.push({ text, url: resolved });
    }
  });

  const bodyHtml = $article.html() || "";

  return {
    sourceUrl,
    canonicalUrl: canonicalHref,
    oldSlug,
    title,
    seoTitle,
    metaDescription,
    publishedAt,
    updatedAt,
    author,
    categories,
    tags,
    featuredImageUrl,
    featuredImageAlt,
    inlineImages,
    bodyHtml,
    internalLinks,
    externalLinks,
    ctaLinks,
    rawHtml: html,
  };
}
