"use client";

import Link from "next/link";
import { GuessResult } from "@/stores/gameStore";

interface GameOverModalProps {
  finalScore: number;
  allGuesses: GuessResult[];
  totalRounds: number;
  onDismiss: () => void;
  onJoinLeaderboard: () => void;
}

export default function GameOverModal({
  finalScore,
  allGuesses,
  totalRounds,
  onDismiss,
  onJoinLeaderboard,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full p-6 shadow-lg">
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
            {finalScore.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Score</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded text-center">
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Best Round</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {stats.bestScore}
            </p>
          </div>
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded text-center">
            <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">Avg Error</p>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
              {stats.avgError}%
            </p>
          </div>
        </div>

        {/* Join Leaderboard button */}
        <button
          onClick={onJoinLeaderboard}
          className="block w-full text-center py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 transition mb-3 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          Join the Leaderboard
        </button>

        {/* View Leaderboard link */}
        <Link
          href="/leaderboard"
          className="block w-full text-center py-2 text-blue-600 dark:text-blue-400 hover:underline text-sm mb-3"
        >
          View Leaderboard →
        </Link>

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
