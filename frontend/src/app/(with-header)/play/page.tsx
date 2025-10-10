// "use client";

// import Link from "next/link";

// export default function PlayPage() {
//   return (
//     <main className="flex flex-col items-center justify-center p-4 text-center">
//       <h1 className="text-4xl font-bold mb-4">RentQuest</h1>
//       <p className="text-lg mb-8 text-neutral-600">Game goes here.</p>

//       <Link href="/" className="bg-black text-white px-6 py-3 rounded-full text-lg hover:opacity-90">
//         Back to Home
//       </Link>
//     </main>
//   );
// }

"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import Image from "next/image";
import InvisibleInk from "@/components/ui/Ink";
import AnimatedRentInput from "@/components/ui/RentInput";

const images = ["/app1.webp", "/app2.webp", "/app4.webp", "/app5.webp"];

export default function PlayPage() {
  const [guess, setGuess] = useState(3000);
  const [submitted, setSubmitted] = useState(false);
  const round = 3;
  const totalRounds = 5;
  const score = 500;

  return (
    <main className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto">
      <div className="w-full px-4 py-2 border-b bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center justify-center gap-4 text-sm">
          <span>
            Round {round} / {totalRounds}
          </span>
          <span>Score: {score}</span>
        </div>

        <div className="w-full sm:w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${(round / totalRounds) * 100}%` }} />
        </div>
      </div>
      <Carousel className="w-full max-w-sm mb-6">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="w-full aspect-[4/3] relative">
                <Image src={src} alt={`Apartment ${index + 1}`} fill className="object-cover rounded-md" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <br />
      <br />
      <InvisibleInk>2 Bed / 1 Bath</InvisibleInk>
      <br />
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <Slider
          min={500}
          max={10000}
          step={50}
          value={[guess]}
          onValueChange={(val) => setGuess(val[0])}
          className="w-full"
        />

        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(Number(e.target.value))}
          className="w-32 border rounded px-2 py-1 text-center bg-white text-black dark:bg-neutral-800 dark:text-white dark:border-neutral-600"
        />
      </div>
      <br />
      <AnimatedRentInput />
      <button
        onClick={() => setSubmitted(true)}
        className="bg-black text-white px-6 py-2 mt-4 rounded hover:opacity-90 dark:bg-white dark:text-black dark:hover:opacity-80"
      >
        Submit Guess
      </button>
      {submitted && (
        <div className="mt-6 text-center">
          <p className="text-lg">
            Real Rent: $4200 <br />
            You guessed: ${guess}
          </p>
          <p className="mt-2">You were off by ${Math.abs(guess - 4200)}</p>
        </div>
      )}
    </main>
  );
}
