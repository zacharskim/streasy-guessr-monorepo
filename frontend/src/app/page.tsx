"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import BuildingIcon from "./building.png";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 text-neutral-900 font-serif">
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <Image src={BuildingIcon} alt="Building Icon" width={96} height={96} className="mb-6" />
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Rent Golf</h1>
        <p className="text-2xl mb-8 text-neutral-600">Finally — a way to flex your StreetEasy addiction.</p>
        <button
          onClick={() => router.push("/play")}
          className="bg-black text-white px-6 py-3 rounded-full text-lg hover:opacity-90"
        >
          Play Now
        </button>
      </main>
    </div>
  );
}
