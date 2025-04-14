import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import Link from "next/link";

export function InfoMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="uppercase text-sm hover:underline">Info</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/how-to-play">How to Play</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/about">About</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/report-bug">Report a Bug</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/feedback">Leave Feedback</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
