"use client";

import { GuessResult } from "@/stores/gameStore";

interface GuessResultCardProps {
  guess: GuessResult;
  onNextRound?: () => void;
  isLastRound: boolean;
  finalScore?: number;
}

export default function GuessResultCard({
  guess,
  onNextRound,
  isLastRound,
  finalScore,
}: GuessResultCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-center p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg w-full">
        <p className="text-sm text-gray-600 dark:text-gray-400">Actual Rent</p>
        <p className="text-2xl font-bold">${guess.actual_rent}</p>
      </div>
      <div className="text-center p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg w-full">
        <p className="text-sm text-gray-600 dark:text-gray-400">Your Guess</p>
        <p className="text-2xl font-bold">${guess.guessed_rent}</p>
      </div>
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg w-full">
        <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{guess.score}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Off by ${guess.difference} ({guess.percentage_off}%)
        </p>
      </div>

      {isLastRound ? (
        <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg w-full">
          <p className="text-lg font-bold">Game Over!</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            Final Score: {finalScore}
          </p>
        </div>
      ) : (
        <button
          onClick={onNextRound}
          className="bg-black text-white px-6 py-2 rounded hover:opacity-90 mt-4 w-full dark:bg-white dark:text-black dark:hover:opacity-80"
        >
          Next Apartment
        </button>
      )}
    </div>
  );
}
