"use client";

import { useState } from "react";
import { GuessResult } from "@/stores/gameStore";
import GameOverModal from "@/components/GameOverModal";

interface GuessResultCardProps {
  guess: GuessResult;
  onNextRound?: () => void;
  isLastRound: boolean;
  finalScore?: number;
  allGuesses?: GuessResult[];
  totalRounds?: number;
}

export default function GuessResultCard({
  guess,
  onNextRound,
  isLastRound,
  finalScore,
  allGuesses = [],
  totalRounds = 5,
}: GuessResultCardProps) {
  const [showGameOverModal, setShowGameOverModal] = useState(isLastRound);

  // Calculate game stats for Game Over screen
  const calculateStats = () => {
    if (allGuesses.length === 0) return { avgError: 0, bestScore: 0, worstScore: 0 };

    const scores = allGuesses.map(g => g.score);
    const errors = allGuesses.map(g => g.percentage_off);

    return {
      avgError: (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1),
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      totalGuesses: allGuesses.length,
    };
  };

  const stats = calculateStats();

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        {/* Row 1: Actual Rent and Your Guess side by side */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center py-1 px-2 bg-gray-100 dark:bg-neutral-800 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Actual</p>
            <p className="text-base font-bold">${guess.actual_rent.toLocaleString()}</p>
          </div>
          <div className="text-center py-1 px-2 bg-gray-100 dark:bg-neutral-800 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Your Guess</p>
            <p className="text-base font-bold">${guess.guessed_rent.toLocaleString()}</p>
          </div>
        </div>

        {/* Row 2: Score and Off By */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center py-1 px-2 bg-blue-100 dark:bg-blue-900 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300">Score</p>
            <p className="text-base font-bold text-blue-700 dark:text-blue-300">{guess.score}</p>
          </div>
          <div className="text-center py-1 px-2 bg-orange-100 dark:bg-orange-900 rounded">
            <p className="text-sm text-orange-700 dark:text-orange-300">Off By</p>
            <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
              ${guess.difference} ({guess.percentage_off}%)
            </p>
          </div>
        </div>

        {/* Button or Game Over */}
        {isLastRound ? (
          <div >
          </div>
        ) : (
          <button
            onClick={onNextRound}
            className="mt-1 px-4 py-2 bg-black text-white font-semibold rounded text-sm hover:bg-gray-800 active:scale-95 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-100 w-full"
          >
            Next Apartment
          </button>
        )}
      </div>

      {/* Game Over Modal */}
      {isLastRound && showGameOverModal && (
        <GameOverModal
          finalScore={finalScore || 0}
          allGuesses={allGuesses}
          totalRounds={totalRounds}
          onDismiss={() => setShowGameOverModal(false)}
        />
      )}
    </>
  );
}
