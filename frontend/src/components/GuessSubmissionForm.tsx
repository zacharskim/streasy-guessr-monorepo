"use client";

import { Slider } from "@/components/ui/slider";

interface GuessSubmissionFormProps {
  guessValue: number;
  onGuessChange: (value: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function GuessSubmissionForm({
  guessValue,
  onGuessChange,
  onSubmit,
  isLoading,
}: GuessSubmissionFormProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full">
        <Slider
          min={500}
          max={10000}
          step={50}
          value={[guessValue]}
          onValueChange={(val) => onGuessChange(val[0])}
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-center gap-4 w-full">
        <input
          type="number"
          value={guessValue}
          onChange={(e) => onGuessChange(Number(e.target.value))}
          min={500}
          max={10000}
          className="flex-1 max-w-xs border rounded px-3 py-2 text-center bg-white text-black dark:bg-neutral-800 dark:text-white dark:border-neutral-600"
        />
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-black text-white px-8 py-2 rounded hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:opacity-80 whitespace-nowrap"
        >
          {isLoading ? "Submitting..." : "Submit Guess"}
        </button>
      </div>
    </div>
  );
}
