import { Button } from "@plainconceptsplatform/ui-components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@plainconceptsplatform/ui-components/tooltip";

export function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Themed with our tokens</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
