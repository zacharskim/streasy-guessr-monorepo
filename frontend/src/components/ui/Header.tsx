import Link from "next/link";
import Image from "next/image";
import { InfoMenu } from "./InfoMenu";
import BuildingIcon from "@/app/building.png";
import { DarkModeToggle } from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b">
      <Link href="/" className="flex items-center">
        <Image src={BuildingIcon} alt="Building Icon" width={24} height={24} className="h-6 w-6 mr-2 dark:invert" />
        <span className="font-bold text-lg">Rent Golf</span>
      </Link>

      <nav className="flex gap-4 text-sm uppercase items-center">
        <Link
          href="/play"
          className="ml-auto bg-black text-white px-3 py-1 rounded hover:opacity-90 text-xs dark:bg-white dark:text-black dark:hover:opacity-80"
        >
          New Game
        </Link>
        <Link href="/catalog" className="hover:underline">
          Catalog
        </Link>
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
        <InfoMenu />
        <DarkModeToggle />
      </nav>
    </header>
  );
}
