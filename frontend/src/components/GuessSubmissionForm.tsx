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
  const priceToSlider = (price: number): number => {
    const clampedPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, price));
    const minLog = Math.log(MIN_PRICE);
    const maxLog = Math.log(MAX_PRICE);
    const priceLog = Math.log(clampedPrice);
    const normalized = (priceLog - minLog) / (maxLog - minLog);
    return Math.pow(normalized, 0.88) * 100;
  };

  const sliderToPrice = (sliderValue: number): number => {
    const minLog = Math.log(MIN_PRICE);
    const maxLog = Math.log(MAX_PRICE);
    const normalized = Math.pow(sliderValue / 100, 1 / 0.88);
    const price = Math.exp(minLog + normalized * (maxLog - minLog));
    return Math.round(price / 25) * 25;
  };

  const sliderValue = useMemo(() => priceToSlider(guessValue), [guessValue]);

  const handleSliderChange = (val: number[]) => {
    onGuessChange(sliderToPrice(val[0]));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) onGuessChange(value);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Slider
        min={0}
        max={100}
        step={0.5}
        value={[sliderValue]}
        onValueChange={handleSliderChange}
        className="w-full"
      />
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 max-w-xs relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none text-sm">$</span>
          <input
            type="number"
            value={guessValue}
            onChange={handleInputChange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            className="w-full border border-border bg-background px-3 py-2 pl-7 text-center text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-foreground text-background px-8 py-2 text-xs tracking-widest uppercase hover:opacity-80 disabled:opacity-40 transition-opacity whitespace-nowrap"
        >
          {isLoading ? "..." : "Submit Guess"}
        </button>
      </div>
    </div>
  );
}
