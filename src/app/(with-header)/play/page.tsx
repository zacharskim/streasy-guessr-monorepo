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

const images = ["/app1.webp", "/app2.webp", "/app3.webp", "/app4.webp", "/app5.webp"];

export default function PlayPage() {
  const [guess, setGuess] = useState(3000);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Guess the Rent</h1>

      <Carousel className="w-full max-w-sm mb-6">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <Image src={src} alt={`Apartment ${index + 1}`} width={400} height={300} className="rounded-md" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="flex items-center gap-2 mb-4">
        <Slider min={500} max={10000} step={50} value={[guess]} onValueChange={(val) => setGuess(val[0])} />
        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(Number(e.target.value))}
          className="w-24 border rounded px-2 py-1 text-center"
        />
      </div>

      <button onClick={() => setSubmitted(true)} className="bg-black text-white px-6 py-2 rounded hover:opacity-90">
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
