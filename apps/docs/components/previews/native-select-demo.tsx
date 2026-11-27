"use client";

import { Field } from "@plainconceptsplatform/ui-components/field";
import { Label } from "@plainconceptsplatform/ui-components/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@plainconceptsplatform/ui-components/native-select";

export function NativeSelectDemo() {
  return (
    <Field className="max-w-xs">
      <Label htmlFor="framework">Framework</Label>
      <NativeSelect id="framework" defaultValue="next">
        <NativeSelectOption value="next">Next.js</NativeSelectOption>
        <NativeSelectOption value="vite">Vite</NativeSelectOption>
        <NativeSelectOption value="remix">Remix</NativeSelectOption>
        <NativeSelectOption value="astro">Astro</NativeSelectOption>
      </NativeSelect>
    </Field>
  );
}
