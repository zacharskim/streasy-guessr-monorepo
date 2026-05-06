"use client";

import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/stores/gameStore";

export default function WithHeaderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { resetGame } = useGameStore();

  const handleResetGame = () => {
    resetGame();
    router.push("/?newgame=true");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onResetGame={handleResetGame} onNewGame={handleResetGame} />
      <div className="flex flex-col flex-1">{children}</div>
      <Footer />
    </div>
  );
}
