"use client";

import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">RentQuest</h1>
      <p className="text-lg mb-8 text-neutral-600">Game goes here.</p>

      <Link href="/" className="bg-black text-white px-6 py-3 rounded-full text-lg hover:opacity-90">
        Back to Home
      </Link>
    </main>
  );
}
