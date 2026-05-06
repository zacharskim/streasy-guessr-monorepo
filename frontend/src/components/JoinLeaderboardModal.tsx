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
      setError("Enter a name");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/leaderboard`,
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
      if (!response.ok) throw new Error("Failed to submit score");
      setSubmitted(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/60 flex items-center justify-center z-50 p-4">
      <div className="relative bg-background border border-border max-w-sm w-full p-8 animate-reveal-up">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <p className="font-display text-3xl font-bold mb-2">Nice.</p>
            <p className="text-sm text-muted-foreground">
              {playerName} — {finalScore.toFixed(1)} pts added to the board.
            </p>
            <p className="text-xs text-muted-foreground mt-4">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Your score</p>
              <p className="font-display text-4xl font-bold">{finalScore.toFixed(1)}</p>
            </div>

            <div className="border-t border-border pt-5">
              <label htmlFor="name" className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                disabled={submitting}
                autoFocus
              />
              {error && <p className="text-destructive text-xs mt-1">{error}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-foreground text-background text-xs tracking-widest uppercase hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                disabled={submitting}
                className="flex-1 py-2.5 border border-border text-xs tracking-widest uppercase hover:bg-muted transition-colors disabled:opacity-40"
              >
                Skip
              </button>
            </div>

            <div className="text-center">
              <Link href="/leaderboard" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                View leaderboard
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
