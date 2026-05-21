type Span = {
  _key: string;
  _type: "span";
  text: string;
  marks?: string[];
};

type MarkDef = {
  _key: string;
  _type: "link";
  href: string;
};

export type PortableTextBlock = {
  _key: string;
  _type: "block";
  style: "normal" | "h2" | "h3" | "blockquote";
  children: Span[];
  markDefs: MarkDef[];
  listItem?: "bullet" | "number";
  level?: number;
};

export function markdownToPortableText(markdown: string): PortableTextBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: PortableTextBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(createBlock(paragraph.join(" ").trim(), "normal"));
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    const quote = line.match(/^>\s+(.+)/);
    const bullet = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^\d+\.\s+(.+)/);

    if (h2 || h3 || quote || bullet || numbered) flushParagraph();
    if (h2) blocks.push(createBlock(h2[1], "h2"));
    else if (h3) blocks.push(createBlock(h3[1], "h3"));
    else if (quote) blocks.push(createBlock(quote[1], "blockquote"));
    else if (bullet) blocks.push({ ...createBlock(bullet[1], "normal"), listItem: "bullet", level: 1 });
    else if (numbered) blocks.push({ ...createBlock(numbered[1], "normal"), listItem: "number", level: 1 });
    else paragraph.push(line);
  }
  flushParagraph();

  return blocks;
}

function createBlock(text: string, style: PortableTextBlock["style"]): PortableTextBlock {
  const markDefs: MarkDef[] = [];
  const children: Span[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      children.push({ _key: key(), _type: "span", text: cleanInline(text.slice(cursor, match.index)), marks: [] });
    }
    const markKey = key();
    markDefs.push({ _key: markKey, _type: "link", href: match[2] });
    children.push({ _key: key(), _type: "span", text: cleanInline(match[1]), marks: [markKey] });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) children.push({ _key: key(), _type: "span", text: cleanInline(text.slice(cursor)), marks: [] });

  return {
    _key: key(),
    _type: "block",
    style,
    children: children.length ? children : [{ _key: key(), _type: "span", text: "", marks: [] }],
    markDefs,
  };
}

function cleanInline(value: string) {
  return value.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1");
}

function key() {
  return Math.random().toString(36).slice(2, 12);
}
