"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  Link2,
  Unlink,
  ImageIcon,
  Undo2,
  Redo2,
  Highlighter,
  Video,
  Table as TableIcon,
} from "lucide-react";

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedHtml = useRef(value || "");
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      // TipTap v3 StarterKit already includes Link + Underline — do not add them again.
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            class: "tiptap-link",
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
        bulletList: {
          HTMLAttributes: { class: "tiptap-ul" },
        },
        orderedList: {
          HTMLAttributes: { class: "tiptap-ol" },
        },
        listItem: {
          HTMLAttributes: { class: "tiptap-li" },
        },
        heading: {
          levels: [2, 3, 4],
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "tiptap-image" },
      }),
      Youtube.configure({ width: 640, height: 360 }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Write your blog content here...",
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      lastEmittedHtml.current = html;
      onChangeRef.current(html);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor-content focus:outline-none",
      },
      handleDOMEvents: {
        click: (_view, event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest("a")) {
            event.preventDefault();
          }
          return false;
        },
      },
    },
  });

  // Sync when parent loads/changes content from outside (edit page), not on every keystroke.
  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (next === lastEmittedHtml.current) return;
    lastEmittedHtml.current = next;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[380px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
    );
  }

  const activeEditor = editor;

  const buttonClass = (active?: boolean) =>
    `rounded-lg p-2 transition ${
      active
        ? "bg-primary text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  function setLink() {
    const previous = activeEditor.getAttributes("link").href as string | undefined;
    const raw = window.prompt("Enter link URL", previous || "https://");
    if (raw === null) return;

    const url = normalizeUrl(raw);
    if (!url) {
      activeEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    activeEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  }

  async function uploadImageFile(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body,
    });
    const data = await response.json();
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Upload failed");
    }
    activeEditor.chain().focus().setImage({ src: data.url }).run();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <button
          type="button"
          title="Bold"
          className={buttonClass(activeEditor.isActive("bold"))}
          onClick={() => activeEditor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Italic"
          className={buttonClass(activeEditor.isActive("italic"))}
          onClick={() => activeEditor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Underline"
          className={buttonClass(activeEditor.isActive("underline"))}
          onClick={() => activeEditor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Heading 2"
          className={buttonClass(activeEditor.isActive("heading", { level: 2 }))}
          onClick={() =>
            activeEditor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Heading 3"
          className={buttonClass(activeEditor.isActive("heading", { level: 3 }))}
          onClick={() =>
            activeEditor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Bullet list"
          className={buttonClass(activeEditor.isActive("bulletList"))}
          onClick={() => activeEditor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Numbered list"
          className={buttonClass(activeEditor.isActive("orderedList"))}
          onClick={() => activeEditor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Quote"
          className={buttonClass(activeEditor.isActive("blockquote"))}
          onClick={() => activeEditor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Code block"
          className={buttonClass(activeEditor.isActive("codeBlock"))}
          onClick={() => activeEditor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Highlight"
          className={buttonClass(activeEditor.isActive("highlight"))}
          onClick={() => activeEditor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Insert link"
          className={buttonClass(activeEditor.isActive("link"))}
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Remove link"
          className={buttonClass()}
          disabled={!activeEditor.isActive("link")}
          onClick={() => activeEditor.chain().focus().unsetLink().run()}
        >
          <Unlink className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Upload image"
          className={buttonClass()}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            try {
              await uploadImageFile(file);
            } catch (err) {
              window.alert(
                err instanceof Error ? err.message : "Image upload failed",
              );
            }
          }}
        />
        <button
          type="button"
          title="YouTube video"
          className={buttonClass()}
          onClick={() => {
            const url = window.prompt("YouTube URL");
            if (!url) return;
            activeEditor.commands.setYoutubeVideo({ src: url.trim() });
          }}
        >
          <Video className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Insert table"
          className={buttonClass()}
          onClick={() =>
            activeEditor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Undo"
          className={buttonClass()}
          onClick={() => activeEditor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redo"
          className={buttonClass()}
          onClick={() => activeEditor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <input
          type="color"
          className="ml-1 h-9 w-9 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
          onInput={(event) =>
            activeEditor
              .chain()
              .focus()
              .setColor((event.target as HTMLInputElement).value)
              .run()
          }
          title="Text color"
        />
      </div>
      <EditorContent editor={activeEditor} />
    </div>
  );
}
