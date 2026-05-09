"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { getApartmentImageUrl } from "@/lib/apartmentService";
import { useGameStore } from "@/stores/gameStore";

function ApartmentImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">No photo</p>
      </div>
    );
  }
  return <Image src={src} alt={alt} fill className="object-cover" onError={() => setErrored(true)} />;
}
import LandingModal from "@/components/LandingModal";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ApartmentDetailsPanel from "@/components/ApartmentDetailsPanel";
import GuessSubmissionForm from "@/components/GuessSubmissionForm";
import GuessResultCard from "@/components/GuessResultCard";
import { ClientPageRoot } from "next/dist/client/components/client-page";

function HomeInner() {
  const searchParams = useSearchParams();
  const [hasStarted, setHasStarted] = useState(() => searchParams.get("newgame") === "true");
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
    resetGame();
  }, []);


  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;

  const handleSubmitGuess = async () => {
    await submitGuess(guessValue);
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      nextRound();
      setGuessValue(3000);
      if (window.innerWidth < 768) window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderGameContent = () => {
    console.log(loading, 'loading')
      if (loading && !currentApartment) {
      return (
        <main className="flex flex-col items-center justify-center flex-1">
          <p className="text-xs tracking-widest uppercase text-muted-foreground animate-pulse">Loading...</p>
        </main>
      );
    }

    if (!currentApartment) {
      return (
        <main className="flex flex-col items-center justify-center flex-1 gap-4">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">Couldn't load apartment</p>
          <button
            onClick={() => resetGame()}
            className="text-xs tracking-widest uppercase border border-border px-4 py-2 hover:bg-muted transition-colors"
          >
            Try again
          </button>
        </main>
      );
    }

    return (
      <main className="flex flex-col p-4 max-w-6xl mx-auto flex-1">
        <div className="w-full px-4 py-4 border-b border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs tracking-widest uppercase">
              <span>Round {currentRound}/{totalRounds}</span>
              <span className="text-muted-foreground">{totalScore.toFixed(1)} pts</span>
            </div>
            <div className="w-full h-px bg-border overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300"
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
                    <div className="w-full aspect-[4/3] relative bg-muted pointer-events-none">
                      <ApartmentImage src={getApartmentImageUrl(currentApartment, index)} alt={`Apartment photo ${index + 1}`} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* Details Panel - takes up 1 column on desktop, full width on mobile */}
          <div className="lg:col-span-1 p-4 bg-card border border-border">
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
          <div className="mt-4 p-4 border border-border bg-muted flex items-center justify-between gap-4 w-full max-w-sm">
            <p className="text-xs text-muted-foreground">{error}</p>
            <button onClick={clearError} className="text-xs tracking-widest uppercase hover:text-foreground text-muted-foreground transition-colors shrink-0">Dismiss</button>
          </div>
        )}
      </main>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hasStarted && <LandingModal onPlay={() => setHasStarted(true)} />}
      <div className={`flex flex-col flex-1 transition-opacity duration-300 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {hasStarted && <Header onResetGame={() => setHasStarted(false)} onNewGame={() => { resetGame(); setGuessValue(3000); }} />}
        {hasStarted ? renderGameContent() : <div className="flex-1" />}
        {hasStarted && <Footer />}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
