"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

interface InfoDialogProps {
  title: string;
  content: string;
  triggerText: string;
}

// Helper function to parse content and make URLs clickable
// Supports both markdown links [text](url) and plain URLs
function parseContent(text: string) {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const plainUrlRegex = /(https?:\/\/[^\s\]]+)/g;

  let lastIndex = 0;
  const elements: React.ReactNode[] = [];

  // First pass: find markdown links
  let markdownMatch;
  const markdownLinks: Array<{ start: number; end: number; text: string; url: string }> = [];
  while ((markdownMatch = markdownLinkRegex.exec(text)) !== null) {
    markdownLinks.push({
      start: markdownMatch.index,
      end: markdownMatch.index + markdownMatch[0].length,
      text: markdownMatch[1],
      url: markdownMatch[2],
    });
  }

  // Build elements, prioritizing markdown links
  let textIndex = 0;
  for (const link of markdownLinks) {
    // Add text before the link
    if (textIndex < link.start) {
      elements.push(
        <span key={`text-${textIndex}`}>{text.substring(textIndex, link.start)}</span>
      );
    }
    // Add the link
    elements.push(
      <a
        key={`link-${link.start}`}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {link.text}
      </a>
    );
    textIndex = link.end;
  }

  // Add remaining text
  if (textIndex < text.length) {
    elements.push(<span key={`text-${textIndex}`}>{text.substring(textIndex)}</span>);
  }

  return elements.length > 0 ? elements : <span>{text}</span>;
}

export function InfoDialog({ title, content, triggerText }: InfoDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="text-sm hover:underline text-left"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {triggerText}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg max-w-md w-full">
          <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {parseContent(content)}
          </Dialog.Description>
          <Dialog.Close className="mt-4 bg-black text-white px-4 py-2 rounded hover:opacity-90 dark:bg-white dark:text-black dark:hover:opacity-80">
            Close
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
