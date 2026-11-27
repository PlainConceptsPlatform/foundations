import { Checkbox } from "@plainconceptsplatform/ui-components/checkbox";
import { Label } from "@plainconceptsplatform/ui-components/label";

export function LabelDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="label-demo" />
      <Label htmlFor="label-demo">Accept terms and conditions</Label>
    </div>
  );
}
