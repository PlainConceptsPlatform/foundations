"use client";

import { Button } from "@plainconceptsplatform/ui-components/button";
import { Spinner } from "@plainconceptsplatform/ui-components/spinner";

export function SpinnerDemo() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
      <Button disabled>
        <Spinner className="size-4" />
        Loading
      </Button>
    </div>
  );
}
