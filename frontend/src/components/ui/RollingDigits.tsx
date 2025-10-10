import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

const digitVariants = {
  initial: (direction: number) => ({
    y: direction > 0 ? 20 : -20,
    opacity: 0,
    position: "absolute" as const
  }),
  animate: {
    y: 0,
    opacity: 1,
    position: "static" as const,
    transition: { duration: 0.2 }
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -20 : 20,
    opacity: 0,
    position: "absolute" as const,
    transition: { duration: 0.2 }
  })
};

function Digit({ value, direction }: { value: string; direction: number }) {
  return (
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.span
        key={value}
        variants={digitVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        custom={direction}
        className="inline-block w-[1ch]"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function RollingDigits({ number }: { number: number }) {
  const [prevNumber, setPrevNumber] = useState(number);

  useEffect(() => {
    setPrevNumber(number);
  }, [number]);

  const prev = String(prevNumber).padStart(5, " ");
  const next = String(number).padStart(5, " ");

  const direction = number > prevNumber ? 1 : -1;

  return (
    <div className="flex font-mono text-2xl text-white justify-center">
      {next.split("").map((char, i) => (
        <div key={i} className="relative w-[1ch] h-[1em] overflow-hidden text-center">
          <Digit value={char} direction={direction} />
        </div>
      ))}
    </div>
  );
}
