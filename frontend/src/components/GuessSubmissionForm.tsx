"use client";

import { Slider } from "@/components/ui/slider";
import { useMemo } from "react";

interface GuessSubmissionFormProps {
  guessValue: number;
  onGuessChange: (value: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const MIN_PRICE = 500;
const MAX_PRICE = 30000;

export default function GuessSubmissionForm({
  guessValue,
  onGuessChange,
  onSubmit,
  isLoading,
}: GuessSubmissionFormProps) {
  // Convert actual price to logarithmic slider position (0-100) with emphasis on 2k-8k range
  const priceToSlider = (price: number): number => {
    const clampedPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, price));
    const minLog = Math.log(MIN_PRICE);
    const maxLog = Math.log(MAX_PRICE);
    const priceLog = Math.log(clampedPrice);
    // Use a power of 0.88 to compress the extremes and expand the middle (centers around $3k-$3.5k)
    const normalized = (priceLog - minLog) / (maxLog - minLog);
    return Math.pow(normalized, 0.88) * 100;
  };

  // Convert slider position (0-100) to actual price with emphasis on 2k-8k range
  const sliderToPrice = (sliderValue: number): number => {
    const minLog = Math.log(MIN_PRICE);
    const maxLog = Math.log(MAX_PRICE);
    // Apply the inverse power to get back to price space
    const normalized = Math.pow(sliderValue / 100, 1 / 0.88);
    const price = Math.exp(minLog + normalized * (maxLog - minLog));
    return Math.round(price / 25) * 25; // Round to nearest $25 for finer control
  };

  const sliderValue = useMemo(() => priceToSlider(guessValue), [guessValue]);

  const handleSliderChange = (val: number[]) => {
    const price = sliderToPrice(val[0]);
    onGuessChange(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Allow any value the user types, will be clamped by slider math
    if (!isNaN(value)) {
      onGuessChange(value);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full">
        <Slider
          min={0}
          max={100}
          step={0.5}
          value={[sliderValue]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-center gap-4 w-full">
        <div className="flex-1 max-w-xs relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white pointer-events-none">
            $
          </span>
          <input
            type="number"
            value={guessValue}
            onChange={handleInputChange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            className="w-full border rounded px-3 py-2 pl-7 text-center bg-white text-black dark:bg-neutral-800 dark:text-white dark:border-neutral-600"
          />
        </div>
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
