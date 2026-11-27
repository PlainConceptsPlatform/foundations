import { Checkbox } from "@plainconceptsplatform/ui-components/checkbox";
import { Label } from "@plainconceptsplatform/ui-components/label";

export function CheckboxDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" defaultChecked />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  );
}
