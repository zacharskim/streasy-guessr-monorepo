"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { RollingDigits } from "./RollingDigits";

export default function AnimatedRentInput() {
  const [value, setValue] = useState(3000);

  const change = (amount: number) => {
    setValue((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 items-center">
        <button onClick={() => change(-100)} className="rounded bg-zinc-800 px-3 py-1 text-white hover:bg-zinc-700">
          -100
        </button>

        <RollingDigits number={value} />

        <button onClick={() => change(100)} className="rounded bg-zinc-800 px-3 py-1 text-white hover:bg-zinc-700">
          +100
        </button>
      </div>

      {/* Hidden form input if needed */}
      <input type="hidden" name="guess" value={value} />

      <button className="mt-2 rounded bg-white px-4 py-2 text-black">Submit Guess</button>
    </div>
  );
}
