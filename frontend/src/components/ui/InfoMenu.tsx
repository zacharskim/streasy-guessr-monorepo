"use client";

import { useState, useRef, useEffect } from "react";
import { InfoDialog } from "./InfoDialog";

export function InfoMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="text-sm hover:text-accent transition-colors"
      >
        Info
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-background border border-border z-40 py-1">
          {[
            {
              triggerText: "How to Play",
              title: "How to Play",
              content: "Use the slider or input to guess the monthly rent based on the listing photos and details.\n\nEach game is 5 rounds. Your score is the sum of your percentage errors — lower is better.",
            },
            {
              triggerText: "About",
              title: "About Rent Golf",
              content: "Rent Golf uses real NYC apartment listings to test your knowledge of the rental market. Data is sourced from StreetEasy and collected by hand (in the sense that free range chickens are free range).",
            },
            {
              triggerText: "Report a Bug",
              title: "Report a Bug",
              content: "Found something broken? Please open an issue on [GitHub](https://github.com/zacharskim/streasy-guessr-monorepo/issues).",
            },
            {
              triggerText: "Leave Feedback",
              title: "Leave Feedback",
              content: "Have a suggestion? Drop it in [GitHub Discussions](https://github.com/zacharskim/streasy-guessr-monorepo/discussions/1).",
            },
          ].map((item) => (
            <div key={item.triggerText} className="px-4 py-2 hover:bg-muted transition-colors" onClick={() => setOpen(false)}>
              <InfoDialog {...item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
