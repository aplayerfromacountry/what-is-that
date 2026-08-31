import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split lines and parse basic Markdown tokens (Headings, bold, italic, lists, blockquotes)
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-3 space-y-2 pl-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-amber-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={idx} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Heading 1 (# )
    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={index}
          className="text-xl sm:text-2xl font-bold font-playfair tracking-wide text-amber-200 mt-6 mb-3 pb-2.5 border-b border-amber-500/20 flex items-center gap-2.5"
        >
          <span className="w-1.5 h-5 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full inline-block"></span>
          {parseInline(line.replace(/^#\s+/, ""))}
        </h1>
      );
      return;
    }

    // Heading 2 (## )
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={index}
          className="text-lg sm:text-xl font-bold font-playfair text-amber-300/95 mt-5 mb-2.5 flex items-center gap-2"
        >
          <span className="w-1 h-4 bg-amber-400/80 rounded-full inline-block"></span>
          {parseInline(line.replace(/^##\s+/, ""))}
        </h2>
      );
      return;
    }

    // Heading 3 (### )
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={index}
          className="text-base sm:text-lg font-semibold font-playfair text-amber-100/90 mt-4 mb-2"
        >
          {parseInline(line.replace(/^###\s+/, ""))}
        </h3>
      );
      return;
    }

    // Blockquote (> )
    if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <div
          key={index}
          className="my-3.5 p-4 pl-4.5 rounded-r-xl bg-amber-500/[0.06] border-l-4 border-amber-400 text-amber-100/90 italic font-serif text-sm leading-relaxed shadow-sm"
        >
          {parseInline(line.replace(/^>\s+/, ""))}
        </div>
      );
      return;
    }

    // Bullet lists (- or * or •)
    if (line.match(/^[-*•]\s+/)) {
      inList = true;
      const text = line.replace(/^[-*•]\s+/, "");
      listItems.push(
        <li key={index} className="flex items-start gap-2.5 text-slate-300 text-sm leading-relaxed">
          <span className="text-amber-400/80 mt-1 select-none text-xs">◆</span>
          <span className="flex-1">{parseInline(text)}</span>
        </li>
      );
      return;
    }

    // Numbered list (1. 2. etc)
    if (line.match(/^\d+\.\s+/)) {
      flushList();
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      if (match) {
        elements.push(
          <div key={index} className="flex items-start gap-3 my-2 text-sm text-slate-300 leading-relaxed pl-1">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-xs shrink-0 mt-0.5">
              {match[1]}
            </span>
            <div className="flex-1">{parseInline(match[2])}</div>
          </div>
        );
        return;
      }
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={index} className="text-slate-300 text-sm leading-relaxed my-2.5">
        {parseInline(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-slate-200">{elements}</div>;
};
