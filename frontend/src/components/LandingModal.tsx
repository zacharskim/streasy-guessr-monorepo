"use client";

import { useState } from "react";
import Image from "next/image";
import BuildingIcon from "@/app/building.png";

interface LandingModalProps {
  onPlay: () => void;
}

export default function LandingModal({ onPlay }: LandingModalProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePlay = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onPlay();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-background z-50 transition-opacity duration-300 ${isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <main className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
        <Image src={BuildingIcon} alt="Building" width={64} height={64} className="mb-6 dark:invert opacity-80" />
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">New York City</p>
        <h1 className="font-display text-6xl font-bold mb-3 leading-none tracking-tight">Rent<br />Golf</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Finally — a way to flex your StreetEasy addiction.
        </p>
        <button
          onClick={handlePlay}
          disabled={isTransitioning}
          className="bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          Play
        </button>
        <p className="text-xs text-muted-foreground mt-8">5 rounds · lower score wins</p>
      </main>
    </div>
  );
}
