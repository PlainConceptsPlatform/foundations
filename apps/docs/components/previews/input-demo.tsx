import { Input } from "@plainconceptsplatform/ui-components/input";
import { Label } from "@plainconceptsplatform/ui-components/label";

export function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="you@example.com" />
    </div>
  );
}
