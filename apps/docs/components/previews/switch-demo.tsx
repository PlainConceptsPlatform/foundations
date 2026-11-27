import { Label } from "@plainconceptsplatform/ui-components/label";
import { Switch } from "@plainconceptsplatform/ui-components/switch";

export function SwitchDemo() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane mode</Label>
    </div>
  );
}
