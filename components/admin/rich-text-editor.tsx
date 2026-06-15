"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Node } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import { Table as TableExt } from "@tiptap/extension-table";
import { TableRow as TableRowExt } from "@tiptap/extension-table-row";
import { TableHeader as TableHeaderExt } from "@tiptap/extension-table-header";
import { TableCell as TableCellExt } from "@tiptap/extension-table-cell";
import TextAlignExt from "@tiptap/extension-text-align";
import YoutubeExt from "@tiptap/extension-youtube";
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Eraser,
  Grid3x3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
  Video,
} from "lucide-react";

export interface RichTextEditorHandle {
  insertImage: (url: string, alt?: string) => void;
  getHTML: () => string;
  insertRawBlock: (html: string) => void;
}

// ── RawHtmlBlock extension ────────────────────────────────────────────────────
// Preserves jl-* custom divs (CTA blocks, form embeds, callouts) as atomic
// non-editable nodes so they survive Tiptap's parse/serialize cycle.
const rawHtmlStore = new Map<string, string>();

const RawHtmlBlock = Node.create({
  name: "rawHtmlBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return { blockId: { default: "" } };
  },

  parseHTML() {
    return [
      {
        tag: "div",
        priority: 60,
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          const cls = el.className ?? "";
          if (cls.includes("jl-")) {
            const blockId = `jl-${Math.random().toString(36).slice(2)}-${Date.now()}`;
            rawHtmlStore.set(blockId, el.outerHTML);
            return { blockId };
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    // During serialization, emit a sentinel that getHTML() will replace
    return ["div", { "data-jl-block-id": node.attrs.blockId }];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.innerHTML = rawHtmlStore.get(node.attrs.blockId) ?? "";
      dom.style.userSelect = "none";
      dom.style.pointerEvents = "none";
      dom.style.opacity = "0.9";
      dom.setAttribute("contenteditable", "false");
      return { dom };
    };
  },
});

interface Props {
  initialContent: string;
  onChange: (html: string) => void;
  onImageRequest?: () => void;
  insertingImage?: boolean;
  minHeight?: number;
}

const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(
  ({ initialContent, onChange, onImageRequest, insertingImage, minHeight = 320 }, ref) => {
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [videoOpen, setVideoOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit,
        UnderlineExt,
        LinkExt.configure({ openOnClick: false }),
        ImageExt.configure({ HTMLAttributes: { class: "max-w-full rounded-lg my-4" } }),
        TableExt.configure({ resizable: true }),
        TableRowExt,
        TableHeaderExt,
        TableCellExt,
        TextAlignExt.configure({ types: ["heading", "paragraph"] }),
        YoutubeExt.configure({ inline: false }),
        RawHtmlBlock,
      ],
      content: initialContent,
      onUpdate: ({ editor }) => onChange(editor.getHTML()),
      editorProps: {
        attributes: { class: "outline-none" },
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage(url, alt = "") {
        editor?.chain().focus().setImage({ src: url, alt }).run();
      },
      getHTML() {
        const raw = editor?.getHTML() ?? "";
        // Replace rawHtmlBlock sentinel divs with their stored HTML
        return raw.replace(/<div data-jl-block-id="([^"]+)"[^>]*><\/div>/g, (_, id) => {
          return rawHtmlStore.get(id) ?? "";
        });
      },
      insertRawBlock(html: string) {
        // Store in map first, then insert as parsed content so parseHTML fires
        editor?.chain().focus().insertContent(html, {
          parseOptions: { preserveWhitespace: "full" },
        }).run();
      },
    }));

    const commitLink = () => {
      if (!linkUrl.trim()) editor?.chain().focus().unsetLink().run();
      else editor?.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkOpen(false);
      setLinkUrl("");
    };

    const commitVideo = () => {
      if (videoUrl.trim()) editor?.commands.setYoutubeVideo({ src: videoUrl.trim() });
      setVideoOpen(false);
      setVideoUrl("");
    };

    if (!editor) {
      return (
        <div
          className="animate-pulse rounded-lg border border-[#dce4df] bg-zinc-50"
          style={{ minHeight }}
        />
      );
    }

    const headingLevel = editor.isActive("heading", { level: 1 })
      ? "h1"
      : editor.isActive("heading", { level: 2 })
        ? "h2"
        : editor.isActive("heading", { level: 3 })
          ? "h3"
          : "paragraph";

    return (
      <div className="overflow-hidden rounded-lg border border-[#dce4df] bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-[#dce4df] bg-zinc-50 px-2 py-1.5">
          <select
            value={headingLevel}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "paragraph") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: parseInt(v[1]) as 1 | 2 | 3 }).run();
            }}
            className="rounded border border-[#dce4df] bg-white px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0D3D24]"
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          <Sep />

          <TB active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)"><Bold className="h-3.5 w-3.5" /></TB>
          <TB active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)"><Italic className="h-3.5 w-3.5" /></TB>
          <TB active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><Underline className="h-3.5 w-3.5" /></TB>
          <TB active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough className="h-3.5 w-3.5" /></TB>

          <Sep />

          <TB active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List className="h-3.5 w-3.5" /></TB>
          <TB active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></TB>
          <TB active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote"><Quote className="h-3.5 w-3.5" /></TB>

          <Sep />

          {/* Link */}
          <div className="relative">
            <TB active={editor.isActive("link") || linkOpen} onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkOpen((v) => !v); setVideoOpen(false); }} title="Link"><Link2 className="h-3.5 w-3.5" /></TB>
            {linkOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-[#dce4df] bg-white p-1.5 shadow-lg" style={{ minWidth: 248 }}>
                <input autoFocus value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitLink(); if (e.key === "Escape") setLinkOpen(false); }} placeholder="https://..." className="flex-1 rounded border border-[#dce4df] px-2 py-1 text-xs outline-none focus:border-[#0D3D24]" />
                <button type="button" onClick={commitLink} className="rounded bg-[#0D3D24] px-2 py-1 text-xs font-semibold text-white hover:bg-[#145c42]">Set</button>
                <button type="button" onClick={() => setLinkOpen(false)} className="rounded border border-[#dce4df] px-2 py-1 text-xs text-gray-500 hover:bg-zinc-50">✕</button>
              </div>
            )}
          </div>

          {/* Image */}
          {onImageRequest && (
            <TB active={false} onClick={onImageRequest} title="Insert image" disabled={insertingImage}>
              {insertingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
            </TB>
          )}

          {/* Video */}
          <div className="relative">
            <TB active={videoOpen} onClick={() => { setVideoOpen((v) => !v); setLinkOpen(false); }} title="Embed video"><Video className="h-3.5 w-3.5" /></TB>
            {videoOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-[#dce4df] bg-white p-1.5 shadow-lg" style={{ minWidth: 280 }}>
                <input autoFocus value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitVideo(); if (e.key === "Escape") setVideoOpen(false); }} placeholder="YouTube or Vimeo URL…" className="flex-1 rounded border border-[#dce4df] px-2 py-1 text-xs outline-none focus:border-[#0D3D24]" />
                <button type="button" onClick={commitVideo} className="rounded bg-[#0D3D24] px-2 py-1 text-xs font-semibold text-white hover:bg-[#145c42]">Embed</button>
                <button type="button" onClick={() => setVideoOpen(false)} className="rounded border border-[#dce4df] px-2 py-1 text-xs text-gray-500 hover:bg-zinc-50">✕</button>
              </div>
            )}
          </div>

          {/* Table */}
          <TB active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table"><Grid3x3 className="h-3.5 w-3.5" /></TB>

          <Sep />

          <TB active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left"><AlignLeft className="h-3.5 w-3.5" /></TB>
          <TB active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center"><AlignCenter className="h-3.5 w-3.5" /></TB>

          <Sep />

          <TB active={false} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="h-3.5 w-3.5" /></TB>
          <TB active={false} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="h-3.5 w-3.5" /></TB>

          <Sep />

          <TB active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting"><Eraser className="h-3.5 w-3.5" /></TB>
        </div>

        {/* Editor */}
        <EditorContent
          editor={editor}
          className="admin-rich-editor"
          style={{ minHeight }}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;

function Sep() {
  return <div className="mx-1 h-5 w-px bg-[#dce4df]" aria-hidden />;
}

function TB({ active, onClick, title, children, disabled }: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors disabled:opacity-40 ${
        active ? "bg-[#0D3D24]/10 text-[#0D3D24]" : "text-gray-500 hover:bg-zinc-100 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
