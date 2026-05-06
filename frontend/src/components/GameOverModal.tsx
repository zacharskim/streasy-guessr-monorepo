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
  const scores = allGuesses.map(g => g.score);
  const errors = allGuesses.map(g => g.percentage_off);
  const avgError = errors.length ? (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1) : "0";
  const bestScore = scores.length ? Math.min(...scores).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 bg-foreground/60 flex items-center justify-center z-50 p-4">
      <div className="relative bg-background border border-border max-w-sm w-full p-8 animate-reveal-up">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
        >
          ✕
        </button>

        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Game over</p>
        <p className="font-display text-5xl font-bold mb-1">{finalScore.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground mb-8">total score · {totalRounds} rounds</p>

        <div className="grid grid-cols-2 gap-4 mb-8 border-t border-border pt-6">
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Best round</p>
            <p className="text-xl font-semibold">{bestScore}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Avg error</p>
            <p className="text-xl font-semibold">{avgError}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onJoinLeaderboard}
            className="w-full py-2.5 bg-foreground text-background text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
          >
            Join Leaderboard
          </button>
          <Link
            href="/leaderboard"
            className="block w-full py-2.5 text-center text-xs tracking-widest uppercase border border-border hover:bg-muted transition-colors"
          >
            View Leaderboard
          </Link>
          <button
            onClick={onDismiss}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to game
          </button>
        </div>
      </div>
    </div>
  );
}
