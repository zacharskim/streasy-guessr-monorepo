import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { InfoDialog } from "./InfoDialog";

export function InfoMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="uppercase text-sm hover:underline">Info</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-2 ">
        <DropdownMenuItem>
          <InfoDialog
            triggerText="How to Play"
            title="How to Play"
            content="Use the slider or input field to enter your best guess of what the rent is based on the listing pictures and details. Each game has 5 rounds, and your score is the culmative sum of your percentage errors."
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <InfoDialog
            triggerText="About"
            title="About Rent Golf"
            content="This game uses nyc apartment listing data to let you test your knowledge about the nyc rental market."
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <InfoDialog
            triggerText="Report a Bug"
            title="Report a Bug"
            content="Found a bug? Please report it on [github](https://github.com/zacharskim/streasy-guessr-monorepo/issues)."
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <InfoDialog
            triggerText="Leave Feedback"
            title="Leave Feedback"
            content="Have a [suggestion](https://github.com/zacharskim/streasy-guessr-monorepo/discussions/1) for how Rent Golf could be imporved, please let me know!"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
