"use client";

import { useEffect } from "react";
import { GuessResult } from "@/stores/gameStore";

interface GameOverModalProps {
  finalScore: number;
  allGuesses: GuessResult[];
  totalRounds: number;
  onDismiss: () => void;
}

export default function GameOverModal({
  finalScore,
  allGuesses,
  totalRounds,
  onDismiss,
}: GameOverModalProps) {
  // Calculate stats
  const calculateStats = () => {
    if (allGuesses.length === 0) return { avgError: 0, bestScore: 0 };

    const scores = allGuesses.map(g => g.score);
    const errors = allGuesses.map(g => g.percentage_off);

    return {
      avgError: (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1),
      bestScore: Math.min(...scores), // Lower is better
    };
  };

  const stats = calculateStats();

  // Auto-submit to leaderboard on mount
  useEffect(() => {
    const submitScore = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/leaderboard/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScore,
            rounds: totalRounds,
          }),
        });
      } catch (err) {
        console.error('Failed to submit score to leaderboard:', err);
      }
    };

    submitScore();
  }, [finalScore, totalRounds]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
        >
          ✕
        </button>

        {/* Game Over header */}
        <div className="text-center mb-6">
          <p className="text-2xl mb-2">🎉 Game Over! 🎉</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {finalScore}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Score</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded text-center">
            <p className="text-xs text-purple-600 dark:text-purple-300 mb-1">Best Round</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-300">
              {stats.bestScore}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900 rounded text-center">
            <p className="text-xs text-amber-600 dark:text-amber-300 mb-1">Avg Error</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-300">
              {stats.avgError}%
            </p>
          </div>
        </div>

        {/* Leaderboard link */}
        <a
          href="/leaderboard"
          className="block w-full text-center py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition mb-3"
        >
          View Leaderboard →
        </a>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="w-full py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition text-sm"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
}
