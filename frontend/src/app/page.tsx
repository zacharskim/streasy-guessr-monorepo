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
        <div className="w-full px-4 py-2 border-b bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 dark:bg-neutral-900 dark:border-neutral-700">
          <div className="flex items-center justify-center gap-4 text-sm">
            <span>Round {currentRound} / {totalRounds}</span>
            <span>Score: {totalScore}</span>
          </div>
          <div className="w-full sm:w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700">
            <div className="bg-blue-500 h-full transition-all" style={{
              width: `${(currentRound / totalRounds) * 100}%`
            }} />
          </div>
        </div>
        <div className="w-full mb-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carousel - takes up 2 columns on desktop, full width on mobile */}
          <div className="lg:col-span-2 px-8">
            <Carousel className="w-full">
              <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="w-full aspect-[4/3] relative bg-gray-200 dark:bg-neutral-700">
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

        {/* Guess Form - full width below carousel */}
        <div className="w-full mt-6">
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
        {hasStarted && <Header />}
        {hasStarted ? renderGameContent() : <div className="flex-1" />}
        {hasStarted && <Footer />}
      </div>
    </div>
  );
}
