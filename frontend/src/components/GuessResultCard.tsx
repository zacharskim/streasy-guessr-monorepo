"use client";

import { useState, useEffect } from "react";
import { GuessResult } from "@/stores/gameStore";
import GameOverModal from "@/components/GameOverModal";
import JoinLeaderboardModal from "@/components/JoinLeaderboardModal";

interface GuessResultCardProps {
  guess: GuessResult;
  onNextRound?: () => void;
  isLastRound: boolean;
  finalScore?: number;
  allGuesses?: GuessResult[];
  totalRounds?: number;
}

function getFeedback(percentageOff: number): string {
  if (percentageOff < 5) return "Nearly perfect.";
  if (percentageOff < 15) return "Sharp eye.";
  if (percentageOff < 30) return "Not bad.";
  if (percentageOff < 50) return "Getting there.";
  return "Way off.";
}

export default function GuessResultCard({
  guess,
  onNextRound,
  isLastRound,
  finalScore,
  allGuesses = [],
  totalRounds = 5,
}: GuessResultCardProps) {
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  useEffect(() => {
    if (isLastRound) {
      const t = setTimeout(() => setShowGameOverModal(true), 2000);
      return () => clearTimeout(t);
    }
  }, [isLastRound]);
  const [showJoinLeaderboardModal, setShowJoinLeaderboardModal] = useState(false);

  const feedback = getFeedback(guess.percentage_off);
  const over = guess.guessed_rent > guess.actual_rent;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full animate-reveal-up">
        {/* Actual rent — the reveal */}
        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Actual rent</p>
          <p className="font-display text-3xl font-bold leading-none animate-pop-in">
            ${guess.actual_rent.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 animate-fade-in" style={{ animationDelay: "0.2s", opacity: 0 }}>
            {feedback}
          </p>
        </div>

        {/* Stats + Next button row */}
        <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "0.15s", opacity: 0 }}>
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground">Guess</p>
            <p className="font-semibold">${guess.guessed_rent.toLocaleString()}</p>
          </div>
          <div className="border-l border-border pl-4">
            <p className="text-xs tracking-widest uppercase text-muted-foreground">Off by</p>
            <p className="font-semibold text-accent">
              {over ? "+" : "-"}${Math.abs(guess.difference).toLocaleString()}
            </p>
          </div>
          <div className="border-l border-border pl-4">
            <p className="text-xs tracking-widest uppercase text-muted-foreground">Score</p>
            <p className="font-semibold">{guess.score.toFixed(1)}</p>
          </div>

          {!isLastRound && (
            <button
              onClick={onNextRound}
              className="ml-2 shrink-0 bg-foreground text-background px-5 py-2 text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {isLastRound && showGameOverModal && (
        <GameOverModal
          finalScore={finalScore || 0}
          allGuesses={allGuesses}
          totalRounds={totalRounds}
          onDismiss={() => setShowGameOverModal(false)}
          onJoinLeaderboard={() => {
            setShowGameOverModal(false);
            setShowJoinLeaderboardModal(true);
          }}
        />
      )}

      {isLastRound && showJoinLeaderboardModal && (
        <JoinLeaderboardModal
          finalScore={finalScore || 0}
          totalRounds={totalRounds}
          onDismiss={() => setShowJoinLeaderboardModal(false)}
          onSuccess={() => {
            setShowJoinLeaderboardModal(false);
            window.location.href = "/leaderboard";
          }}
        />
      )}
    </>
  );
}
