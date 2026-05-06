"use client";

import { useState } from "react";

interface InfoDialogProps {
  title: string;
  content: string;
  triggerText: string;
}

function parseContent(text: string) {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const elements: React.ReactNode[] = [];
  const links: Array<{ start: number; end: number; text: string; url: string }> = [];

  let match;
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    links.push({ start: match.index, end: match.index + match[0].length, text: match[1], url: match[2] });
  }

  let cursor = 0;
  for (const link of links) {
    if (cursor < link.start) {
      elements.push(<span key={`t-${cursor}`}>{text.substring(cursor, link.start)}</span>);
    }
    elements.push(
      <a key={`l-${link.start}`} href={link.url} target="_blank" rel="noopener noreferrer"
        className="underline underline-offset-4 text-accent hover:opacity-70 transition-opacity">
        {link.text}
      </a>
    );
    cursor = link.end;
  }
  if (cursor < text.length) {
    elements.push(<span key={`t-${cursor}`}>{text.substring(cursor)}</span>);
  }

  return elements.length > 0 ? elements : <span>{text}</span>;
}

export function InfoDialog({ title, content, triggerText }: InfoDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="text-sm text-left w-full hover:text-accent transition-colors"
      >
        {triggerText}
      </button>

      {open && (
        <div className="fixed inset-0 bg-foreground/60 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div
            className="relative bg-background border border-border max-w-sm w-full p-8 animate-reveal-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
            >
              ✕
            </button>

            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Info</p>
            <h2 className="font-display text-2xl font-bold mb-5">{title}</h2>

            <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
              {parseContent(content)}
            </p>

            <button
              onClick={() => setOpen(false)}
              className="mt-8 w-full py-2.5 bg-foreground text-background text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
