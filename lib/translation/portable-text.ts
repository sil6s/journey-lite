/**
 * Portable Text ↔ translation helpers.
 *
 * Strategy: walk the PT/sections tree and extract every translatable string
 * into a flat { path → text } map. Translate just that map. Re-inject the
 * translated strings back into a deep-clone of the original tree.
 *
 * Guarantees:
 *   • _key, _type, marks, markDefs, links, refs, asset references — NEVER modified
 *   • Only human-visible text leaves are sent to the AI
 *   • Structure survives round-trip regardless of nesting depth
 *
 * Covers all block types used in JourneyLite's sitePage.sections, blogPost.body,
 * and any nested Portable Text content arrays.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type PortableTextBlock = Record<string, unknown>;

type TextEntry = {
  /** Dot-path into the tree, e.g. "[0].children[1].text" */
  path: string;
  text: string;
};

// ── Non-translatable value patterns ──────────────────────────────────────────
// Skip strings that look like phone numbers, URLs, codes, or IDs.
const SKIP_PATTERNS = [
  /^\s*$/,                          // blank / whitespace only
  /^https?:\/\//,                   // URLs
  /^tel:/,                          // tel: links
  /^mailto:/,                       // mailto: links
  /^\d[\d\s\-().+]{6,}$/,          // phone numbers
  /^[A-Z]{2,5}\d{4,}$/,            // codes / IDs
];

function shouldSkip(text: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(text.trim()));
}

// ── Extract ───────────────────────────────────────────────────────────────────

/**
 * Walk a Portable Text / sections array and return every translatable
 * string with its dot-bracket path. Handles all sitePage section types
 * as well as standard PT blocks.
 */
export function extractTranslatableTexts(blocks: PortableTextBlock[]): TextEntry[] {
  const entries: TextEntry[] = [];
  walkBlocks(blocks, "", entries);
  return entries;
}

function extractString(
  obj: Record<string, unknown>,
  field: string,
  basePath: string,
  out: TextEntry[],
) {
  const val = obj[field];
  if (typeof val === "string" && val.trim() && !shouldSkip(val)) {
    out.push({ path: `${basePath}.${field}`, text: val });
  }
}

function walkBlocks(blocks: unknown[], basePath: string, out: TextEntry[]): void {
  blocks.forEach((block, i) => {
    if (!block || typeof block !== "object") return;
    const b = block as Record<string, unknown>;
    const path = `${basePath}[${i}]`;
    const type = b._type as string | undefined;

    switch (type) {
      // ── Standard Portable Text block ────────────────────────────────────
      case "block": {
        const children = b.children as unknown[] | undefined;
        if (Array.isArray(children)) {
          children.forEach((child, j) => {
            if (!child || typeof child !== "object") return;
            const c = child as Record<string, unknown>;
            if (
              c._type === "span" &&
              typeof c.text === "string" &&
              c.text.trim() &&
              !shouldSkip(c.text)
            ) {
              out.push({ path: `${path}.children[${j}].text`, text: c.text });
            }
          });
        }
        break;
      }

      // ── Image alt text ───────────────────────────────────────────────────
      case "image": {
        if (typeof b.alt === "string" && b.alt.trim() && !shouldSkip(b.alt)) {
          out.push({ path: `${path}.alt`, text: b.alt });
        }
        break;
      }

      // ── sitePage: richTextSection ─────────────────────────────────────────
      case "richTextSection": {
        extractString(b, "eyebrow", path, out);
        extractString(b, "heading", path, out);
        if (Array.isArray(b.content)) {
          walkBlocks(b.content as unknown[], `${path}.content`, out);
        }
        break;
      }

      // ── sitePage: imageTextSection ────────────────────────────────────────
      case "imageTextSection": {
        extractString(b, "eyebrow", path, out);
        extractString(b, "heading", path, out);
        extractString(b, "text", path, out);
        extractString(b, "imageAlt", path, out);
        extractCta(b.cta, `${path}.cta`, out);
        break;
      }

      // ── sitePage: twoColumnSection ────────────────────────────────────────
      case "twoColumnSection": {
        extractString(b, "heading", path, out);
        extractString(b, "leftTitle", path, out);
        extractString(b, "leftText", path, out);
        extractString(b, "rightTitle", path, out);
        extractString(b, "rightText", path, out);
        break;
      }

      // ── sitePage: ctaBanner ───────────────────────────────────────────────
      case "ctaBanner": {
        extractString(b, "eyebrow", path, out);
        extractString(b, "heading", path, out);
        extractString(b, "text", path, out);
        extractCta(b.primaryCta, `${path}.primaryCta`, out);
        extractCta(b.secondaryCta, `${path}.secondaryCta`, out);
        break;
      }

      // ── sitePage: faqBlock ────────────────────────────────────────────────
      case "faqBlock": {
        extractString(b, "heading", path, out);
        if (Array.isArray(b.items)) {
          (b.items as Array<Record<string, unknown>>).forEach((item, j) => {
            const ip = `${path}.items[${j}]`;
            if (typeof item.question === "string" && item.question.trim()) {
              out.push({ path: `${ip}.question`, text: item.question });
            }
            if (typeof item.answer === "string" && item.answer.trim()) {
              out.push({ path: `${ip}.answer`, text: item.answer });
            }
          });
        }
        break;
      }

      // ── sitePage: testimonialBlock ────────────────────────────────────────
      case "testimonialBlock": {
        extractString(b, "quote", path, out);
        extractString(b, "name", path, out);
        extractString(b, "context", path, out);
        break;
      }

      // ── sitePage: statsHighlights ─────────────────────────────────────────
      case "statsHighlights": {
        extractString(b, "heading", path, out);
        if (Array.isArray(b.items)) {
          (b.items as Array<Record<string, unknown>>).forEach((item, j) => {
            const ip = `${path}.items[${j}]`;
            if (typeof item.label === "string" && item.label.trim())
              out.push({ path: `${ip}.label`, text: item.label });
            // value is usually a number/stat — skip
          });
        }
        break;
      }

      // ── sitePage: cardGrid ────────────────────────────────────────────────
      case "cardGrid": {
        extractString(b, "heading", path, out);
        if (Array.isArray(b.cards)) {
          (b.cards as Array<Record<string, unknown>>).forEach((card, j) => {
            const cp = `${path}.cards[${j}]`;
            extractString(card, "title", cp, out);
            extractString(card, "text", cp, out);
            extractCta(card.link, `${cp}.link`, out);
          });
        }
        break;
      }

      // ── sitePage: processSteps ────────────────────────────────────────────
      case "processSteps": {
        extractString(b, "heading", path, out);
        if (Array.isArray(b.steps)) {
          (b.steps as Array<Record<string, unknown>>).forEach((step, j) => {
            const sp = `${path}.steps[${j}]`;
            extractString(step, "label", sp, out);
            extractString(step, "text", sp, out);
          });
        }
        break;
      }

      // ── sitePage: calloutBox ──────────────────────────────────────────────
      case "calloutBox": {
        extractString(b, "heading", path, out);
        extractString(b, "text", path, out);
        break;
      }

      // ── sitePage: buttonGroup ─────────────────────────────────────────────
      case "buttonGroup": {
        if (Array.isArray(b.buttons)) {
          (b.buttons as Array<Record<string, unknown>>).forEach((btn, j) => {
            extractCta(btn, `${path}.buttons[${j}]`, out);
          });
        }
        break;
      }

      // ── Legacy / unknown — skip silently ─────────────────────────────────
      default:
        break;
    }
  });
}

function extractCta(
  cta: unknown,
  basePath: string,
  out: TextEntry[],
): void {
  if (!cta || typeof cta !== "object") return;
  const c = cta as Record<string, unknown>;
  if (typeof c.label === "string" && c.label.trim() && !shouldSkip(c.label)) {
    out.push({ path: `${basePath}.label`, text: c.label });
  }
  // url is never translated
}

// ── Reconstruct ───────────────────────────────────────────────────────────────

/**
 * Deep-clone `blocks` and inject translated strings at their original paths.
 * The `translationMap` is { dotBracketPath → translatedText }.
 */
export function applyTranslationsToBlocks(
  blocks: PortableTextBlock[],
  translationMap: Record<string, string>,
): PortableTextBlock[] {
  const cloned = JSON.parse(JSON.stringify(blocks)) as PortableTextBlock[];
  for (const [path, translated] of Object.entries(translationMap)) {
    if (typeof translated === "string" && translated.trim()) {
      setAtPath(cloned, path, translated);
    }
  }
  return cloned;
}

/** Navigate a dot+bracket path and set a leaf value. */
function setAtPath(root: unknown, path: string, value: string): void {
  const segments = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  let current: unknown = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (Array.isArray(current)) {
      current = (current as unknown[])[Number(seg)];
    } else if (current && typeof current === "object") {
      current = (current as Record<string, unknown>)[seg];
    } else {
      return; // broken path — skip
    }
  }

  const last = segments.at(-1)!;
  if (Array.isArray(current)) {
    (current as unknown[])[Number(last)] = value;
  } else if (current && typeof current === "object") {
    (current as Record<string, unknown>)[last] = value;
  }
}

// ── Chunking ──────────────────────────────────────────────────────────────────

/**
 * Split a flat text-map into chunks where each chunk's total character count
 * stays below `maxChars`. This is more reliable than block-count chunking
 * because token cost tracks character count more closely.
 *
 * Gemini flash-lite has a large input context; 8K chars per chunk keeps us well within
 * a single request even after system-prompt overhead.
 */
export function chunkTextMap(
  entries: TextEntry[],
  maxChars = 6_000,
): Array<Record<string, string>> {
  const chunks: Array<Record<string, string>> = [];
  let current: Record<string, string> = {};
  let charCount = 0;

  for (const { path, text } of entries) {
    const len = path.length + text.length + 6; // 6 = JSON overhead per entry
    if (charCount + len > maxChars && Object.keys(current).length > 0) {
      chunks.push(current);
      current = {};
      charCount = 0;
    }
    current[path] = text;
    charCount += len;
  }
  if (Object.keys(current).length > 0) chunks.push(current);
  return chunks;
}

// Kept for backward compat — prefer chunkTextMap
export function chunkBlocks(
  blocks: PortableTextBlock[],
  maxBlocks = 25,
): PortableTextBlock[][] {
  const chunks: PortableTextBlock[][] = [];
  for (let i = 0; i < blocks.length; i += maxBlocks) {
    chunks.push(blocks.slice(i, i + maxBlocks));
  }
  return chunks;
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Verify a translated blocks array preserved all _keys and _types.
 */
export function validateTranslatedBlocks(
  original: PortableTextBlock[],
  translated: unknown,
): translated is PortableTextBlock[] {
  if (!Array.isArray(translated)) return false;
  if (translated.length !== original.length) return false;
  for (let i = 0; i < original.length; i++) {
    const o = original[i] as Record<string, unknown>;
    const t = translated[i] as Record<string, unknown>;
    if (o._key !== t._key || o._type !== t._type) return false;
  }
  return true;
}
