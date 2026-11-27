import { Button } from "@plainconceptsplatform/ui-components/button";
import { Input } from "@plainconceptsplatform/ui-components/input";
import { Label } from "@plainconceptsplatform/ui-components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@plainconceptsplatform/ui-components/popover";

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="grid gap-3">
          <Label htmlFor="width">Width</Label>
          <Input id="width" defaultValue="100%" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
