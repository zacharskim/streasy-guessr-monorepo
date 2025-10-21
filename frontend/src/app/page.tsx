"use client";

import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";
import { getApartmentImageUrl } from "@/lib/apartmentService";
import { useGameStore } from "@/stores/gameStore";
import LandingModal from "@/components/LandingModal";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

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
      <main className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto flex-1">
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
        <div className="w-full max-w-2xl mb-6 mt-6 flex gap-6">
          <Carousel className="w-1/2 flex-shrink-0">
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

          <div className="w-1/2 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-y-auto max-h-96">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">Bedrooms</p>
                <p className="text-lg font-semibold">{currentApartment.bedrooms}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">Bathrooms</p>
                <p className="text-lg font-semibold">{Math.floor(currentApartment.bathrooms)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">Sq Ft</p>
                <p className="text-lg font-semibold">{currentApartment.sqft ? currentApartment.sqft.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p><span className="font-semibold">Location:</span> {currentApartment.neighborhood}, {currentApartment.borough}</p>
              {currentApartment.address && <p><span className="font-semibold">Zip:</span> {currentApartment.address}</p>}
              {currentApartment.year_built && <p><span className="font-semibold">Built:</span> {currentApartment.year_built}</p>}
              <p><span className="font-semibold">Photos:</span> {currentApartment.photo_count}</p>
              {currentApartment.listing_url && (
                <a href={currentApartment.listing_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  View on StreetEasy →
                </a>
              )}

              {(currentApartment.amenities && currentApartment.amenities.length > 0) && (
                <div>
                  <p className="font-semibold mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {currentApartment.amenities.map((amenity, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {amenity.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(currentApartment.home_features && currentApartment.home_features.length > 0) && (
                <div>
                  <p className="font-semibold mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {currentApartment.home_features.map((feature, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!submitted ? (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            <div className="w-full">
              <Slider min={500} max={10000} step={50} value={[guessValue]} onValueChange={(val) => setGuessValue(val[0])} className="w-full" />
            </div>
            <div className="flex items-center justify-center gap-4 w-full">
              <input type="number" value={guessValue} onChange={(e) => setGuessValue(Number(e.target.value))} min={500} max={10000} className="flex-1 max-w-xs border rounded px-3 py-2 text-center bg-white text-black dark:bg-neutral-800 dark:text-white dark:border-neutral-600" />
              <button onClick={handleSubmitGuess} disabled={loading} className="bg-black text-white px-8 py-2 rounded hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:opacity-80 whitespace-nowrap">
                {loading ? "Submitting..." : "Submit Guess"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            {lastGuess && (
              <>
                <div className="text-center p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actual Rent</p>
                  <p className="text-2xl font-bold">${lastGuess.actual_rent}</p>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Guess</p>
                  <p className="text-2xl font-bold">${lastGuess.guessed_rent}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{lastGuess.score}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Off by ${lastGuess.difference} ({lastGuess.percentage_off}%)</p>
                </div>
                {currentRound < totalRounds ? (
                  <button onClick={handleNextRound} className="bg-black text-white px-6 py-2 rounded hover:opacity-90 mt-4 w-full dark:bg-white dark:text-black dark:hover:opacity-80">
                    Next Apartment
                  </button>
                ) : (
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg w-full">
                    <p className="text-lg font-bold">Game Over!</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">Final Score: {totalScore}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

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
