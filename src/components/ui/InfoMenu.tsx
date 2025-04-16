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
            content="This is where you explain how to play the game."
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <InfoDialog
            triggerText="About"
            title="About RentQuest"
            content="This is a placeholder for the About section."
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <InfoDialog
            triggerText="Report a Bug"
            title="Report a Bug"
            content="Let us know if you encounter any issues!"
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <InfoDialog
            triggerText="Leave Feedback"
            title="Leave Feedback"
            content="We'd love to hear your thoughts about RentQuest."
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
