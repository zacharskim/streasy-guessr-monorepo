import { useState } from "react";
import "./glitter.css";

export default function InvisibleInk({ children }: { children: string }) {
  const [revealed, setRevealed] = useState(false);

  const chars = children.split("");

  return (
    <span onClick={() => setRevealed(true)} className="inline-flex flex-wrap gap-[2px] cursor-pointer">
      {chars.map((char, i) => (
        <span
          key={i}
          className={`inline-block transition-all duration-300 ${
            revealed ? "text-black translate-x-0 translate-y-0" : "jumble-letter"
          }`}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
