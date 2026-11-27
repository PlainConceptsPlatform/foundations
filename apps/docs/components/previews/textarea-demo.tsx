import { Label } from "@plainconceptsplatform/ui-components/label";
import { Textarea } from "@plainconceptsplatform/ui-components/textarea";

export function TextareaDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  );
}
