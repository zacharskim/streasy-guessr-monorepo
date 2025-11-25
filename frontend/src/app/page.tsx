"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { getApartmentImageUrl } from "@/lib/apartmentService";
import { useGameStore } from "@/stores/gameStore";
import LandingModal from "@/components/LandingModal";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ApartmentDetailsPanel from "@/components/ApartmentDetailsPanel";
import GuessSubmissionForm from "@/components/GuessSubmissionForm";
import GuessResultCard from "@/components/GuessResultCard";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [guessValue, setGuessValue] = useState(3000);

  const {
    currentApartment,
    currentRound,
    totalRounds,
    totalScore,
    submitted,
    loading,
    error,
    guesses,
    resetGame,
    submitGuess,
    nextRound,
    clearError,
  } = useGameStore();

  useEffect(() => {
    // Load apartment data immediately on page load
    resetGame();
  }, [resetGame]);


  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  const handleSubmitGuess = async () => {
    await submitGuess(guessValue);
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      nextRound();
      setGuessValue(3000);
    }
  };

  const renderGameContent = () => {
    if (loading && !currentApartment) {
      return (
        <main className="flex flex-col items-center justify-center p-4 min-h-screen">
          <p className="text-lg">Loading apartment...</p>
        </main>
      );
    }

    if (!currentApartment) {
      return (
        <main className="flex flex-col items-center justify-center p-4 min-h-screen">
          <p className="text-lg">Failed to load apartment</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </main>
      );
    }

    return (
      <main className="flex flex-col p-4 max-w-6xl mx-auto flex-1">
        <div className="w-full px-4 py-4 border-b bg-white dark:bg-neutral-900 dark:border-neutral-700">
          <div className="space-y-3">
            {/* Round info - minimal and subtle */}
            <div className="flex items-center justify-between text-xs tracking-wide font-medium">
              <span>Round {currentRound}/{totalRounds}</span>
              <span className="text-gray-500 dark:text-gray-400">Score: {totalScore.toFixed(2)}</span>
            </div>

            {/* Progress bar - sleek and minimal */}
            <div className="w-full h-1 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-300"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="w-full mb-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carousel - takes up 2 columns on desktop, full width on mobile */}
          <div className="lg:col-span-2 px-8 select-none">
            <Carousel key={currentApartment?.id} className="w-full">
              <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="w-full aspect-[4/3] relative bg-gray-200 dark:bg-neutral-700 pointer-events-none">
                      <Image src={getApartmentImageUrl(currentApartment, index)} alt={`Apartment photo ${index + 1}`} fill className="object-cover rounded-md" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* Details Panel - takes up 1 column on desktop, full width on mobile */}
          <div className="lg:col-span-1 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
            <ApartmentDetailsPanel apartment={currentApartment} />
          </div>
        </div>

        {/* Guess Form - fixed height to prevent page jump */}
        <div className="w-full h-32">
          {!submitted ? (
            <GuessSubmissionForm
              guessValue={guessValue}
              onGuessChange={setGuessValue}
              onSubmit={handleSubmitGuess}
              isLoading={loading}
            />
          ) : (
            lastGuess && (
              <GuessResultCard
                guess={lastGuess}
                onNextRound={handleNextRound}
                isLastRound={currentRound >= totalRounds}
                finalScore={totalScore}
                allGuesses={guesses}
                totalRounds={totalRounds}
              />
            )
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded w-full max-w-sm">
            <p>{error}</p>
            <button onClick={clearError} className="text-sm mt-2 underline">Dismiss</button>
          </div>
        )}
      </main>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-800">
      {!hasStarted && <LandingModal onPlay={() => setHasStarted(true)} />}
      <div className={`flex flex-col flex-1 transition-opacity duration-300 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {hasStarted && <Header onResetGame={() => setHasStarted(false)} />}
        {hasStarted ? renderGameContent() : <div className="flex-1" />}
        {hasStarted && <Footer />}
      </div>
    </div>
  );
}
