"use client";

import Image from "next/image";
import { useState } from "react";
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
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-900 font-serif transition-opacity duration-300 z-50 ${isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <main className="flex flex-col items-center justify-center p-4 text-center">
        <Image src={BuildingIcon} alt="Building Icon" width={96} height={96} className="mb-6" />
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Rent Golf</h1>
        <p className="text-2xl mb-8 text-neutral-600">Finally — a way to flex your StreetEasy addiction.</p>
        <button
          onClick={handlePlay}
          disabled={isTransitioning}
          className="bg-black text-white px-6 py-3 rounded-full text-lg hover:opacity-90 transition-opacity"
        >
          Play Now
        </button>
      </main>
    </div>
  );
}
