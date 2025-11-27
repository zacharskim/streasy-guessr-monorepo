"use client";

import { useState } from "react";
import Link from "next/link";

interface JoinLeaderboardModalProps {
  finalScore: number;
  totalRounds: number;
  onDismiss: () => void;
  onSuccess: () => void;
}

export default function JoinLeaderboardModal({
  finalScore,
  totalRounds,
  onDismiss,
  onSuccess,
}: JoinLeaderboardModalProps) {
  const [playerName, setPlayerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leaderboard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player_name: playerName.trim(),
            total_score: finalScore,
            rounds_played: totalRounds,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit score");
      }

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

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

        {submitted ? (
          /* Success Screen */
          <div className="text-center">
            <p className="text-2xl mb-4">🎉</p>
            <p className="text-lg font-bold mb-4 text-green-600 dark:text-green-400">
              Score Added!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {playerName}, your score of {finalScore.toFixed(2)} has been added to the leaderboard.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Redirecting to leaderboard...
            </p>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Join the Leaderboard
              </h2>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                disabled={submitting}
                autoFocus
              />
              {error && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {error}
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Score: <span className="font-bold">{finalScore.toFixed(2)}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-black text-white font-semibold rounded hover:opacity-90 disabled:opacity-50 transition dark:bg-white dark:text-black dark:hover:opacity-80"
              >
                {submitting ? "Adding..." : "Add to Leaderboard"}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                disabled={submitting}
                className="flex-1 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition disabled:opacity-50"
              >
                Skip
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/leaderboard"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Leaderboard →
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
