export type BlogPacketLink = { label: string; url: string };

export type BlogPacket = {
  contentMode?: string;
  title: string;
  slug: string;
  resourceType?: string;
  category?: string;
  tags: string[];
  seoFocusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  readingTime?: string;
  author?: string;
  reviewedBy?: string;
  excerpt: string;
  featuredImageAltText: string;
  internalLinks: BlogPacketLink[];
  externalSources: BlogPacketLink[];
  body: string;
};

export type BlogPacketParseResult = {
  packet?: BlogPacket;
  errors: string[];
  warnings: string[];
};

const sectionMap: Record<string, keyof BlogPacket> = {
  "content mode": "contentMode",
  title: "title",
  slug: "slug",
  "resource type": "resourceType",
  category: "category",
  tags: "tags",
  "seo focus keyword": "seoFocusKeyword",
  "meta title": "metaTitle",
  "meta description": "metaDescription",
  "reading time": "readingTime",
  author: "author",
  "reviewed by": "reviewedBy",
  excerpt: "excerpt",
  "featured image alt text": "featuredImageAltText",
  "internal links": "internalLinks",
  "external sources": "externalSources",
  body: "body",
};

const requiredFields: Array<keyof BlogPacket> = [
  "title",
  "slug",
  "category",
  "seoFocusKeyword",
  "metaTitle",
  "metaDescription",
  "excerpt",
  "featuredImageAltText",
  "body",
];

export function parseBlogPacket(markdown: string): BlogPacketParseResult {
  const sections = extractSections(markdown);
  const packet: BlogPacket = {
    title: readSection(sections, "title"),
    slug: slugify(readSection(sections, "slug")),
    category: readSection(sections, "category"),
    tags: parseList(readSection(sections, "tags")),
    seoFocusKeyword: readSection(sections, "seo focus keyword"),
    metaTitle: readSection(sections, "meta title"),
    metaDescription: readSection(sections, "meta description"),
    excerpt: readSection(sections, "excerpt"),
    featuredImageAltText: readSection(sections, "featured image alt text"),
    body: readSection(sections, "body"),
    contentMode: readSection(sections, "content mode"),
    resourceType: readSection(sections, "resource type"),
    readingTime: readSection(sections, "reading time"),
    author: readSection(sections, "author"),
    reviewedBy: readSection(sections, "reviewed by"),
    internalLinks: parseLinks(readSection(sections, "internal links")),
    externalSources: parseLinks(readSection(sections, "external sources")),
  };

  const errors = requiredFields.flatMap((field) => {
    const value = packet[field];
    return value && (!Array.isArray(value) || value.length) ? [] : [`Missing required section: ${labelForField(field)}.`];
  });
  const warnings = [
    packet.metaTitle && packet.metaTitle.length > 70 ? "Meta title is longer than 70 characters." : "",
    packet.metaDescription && packet.metaDescription.length > 170 ? "Meta description is longer than 170 characters." : "",
    packet.internalLinks.length === 0 ? "No internal links were found." : "",
    packet.externalSources.length === 0 ? "No external sources were found." : "",
  ].filter(Boolean);

  return { packet: errors.length ? undefined : packet, errors, warnings };
}

function extractSections(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = new Map<string, string[]>();
  let current: string | null = null;

  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) {
      const normalized = match[1].trim().toLowerCase();
      current = sectionMap[normalized] ? normalized : null;
      if (current) sections.set(current, []);
      continue;
    }
    if (current) sections.get(current)?.push(line);
  }

  return sections;
}

function readSection(sections: Map<string, string[]>, key: string) {
  return (sections.get(key) ?? []).join("\n").trim();
}

function parseList(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

function parseLinks(value: string): BlogPacketLink[] {
  return parseList(value)
    .map((line) => {
      const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return match ? { label: match[1], url: match[2] } : undefined;
    })
    .filter((link): link is BlogPacketLink => Boolean(link));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function labelForField(field: keyof BlogPacket) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
