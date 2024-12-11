// export default function Home() {
//   return (
//     <div>
//       hello world
//     </div>
//   );
// }

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Map, Trophy, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BuildingIcon from "./building.png";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          {/* <Globe className="h-6 w-6 mr-2" /> */}
          <Image
            src={BuildingIcon}
            alt="Building Icon"
            width={24}
            height={24}
            className="h-6 w-6 mr-2"
          />
          <span className="font-bold text-lg">Streasy Guessr</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            How to Play
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Leaderboard
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            About
          </Link>
          {/* <a will need to go in credits section...
            href="https://www.flaticon.com/free-icons/empire-state-building"
            title="empire state building icons"
          >
            Empire state building icons created by Payungkead - Flaticon
          </a> */}
        </nav>
      </header>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 GlobeQuest. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
