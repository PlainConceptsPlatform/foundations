"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@plainconceptsplatform/ui-components/field";
import { Input } from "@plainconceptsplatform/ui-components/input";

export function FieldDemo() {
  return (
    <FieldGroup className="max-w-sm">
      <FieldSet>
        <FieldLegend variant="label">Account details</FieldLegend>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" placeholder="you@example.com" />
          <FieldDescription>We'll never share your email with anyone.</FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel>Remember me</FieldLabel>
          <Input type="checkbox" className="size-4" />
        </Field>
      </FieldSet>
    </FieldGroup>
  );
}
