"use client";

import Link from "next/link";
import { InfoMenu } from "./InfoMenu";
import { DarkModeToggle } from "./DarkModeToggle";
import { useGameStore } from "@/stores/gameStore";

interface HeaderProps {
  onResetGame: () => void;
  onNewGame?: () => void;
}

export default function Header({ onResetGame, onNewGame }: HeaderProps) {
  const { resetGame } = useGameStore();

  const handleLogoClick = () => {
    onResetGame();
    resetGame();
  };

  const handleNewGame = () => {
    if (onNewGame) {
      onNewGame();
    } else {
      resetGame();
    }
  };

  return (
    <header className="px-5 lg:px-8 h-14 flex items-center justify-between border-b border-border">
      <Link href="/" className="flex items-center gap-2" onClick={handleLogoClick}>
        <span className="font-display font-bold text-xl tracking-tight">Rent Golf</span>
      </Link>

      <nav className="flex gap-5 text-sm items-center">
        <button
          onClick={handleNewGame}
          className="text-xs tracking-widest uppercase border border-foreground px-3 py-1 hover:bg-foreground hover:text-background transition-colors"
        >
          New Game
        </button>
        <Link href="/leaderboard" className="text-sm hover:text-accent transition-colors">
          Leaderboard
        </Link>
        <InfoMenu />
        <DarkModeToggle />
      </nav>
    </header>
  );
}
