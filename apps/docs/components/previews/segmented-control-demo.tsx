"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";

import { SegmentedControl } from "@plainconceptsplatform/ui-components/segmented-control";

export function SegmentedControlDemo() {
  const [dateFilter, setDateFilter] = useState<"before" | "on-date" | "after">("before");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Text options</p>
        <SegmentedControl
          className="rounded-md bg-muted"
          value={dateFilter}
          onChange={setDateFilter}
          options={[
            { value: "before", label: "Before" },
            { value: "on-date", label: "On date" },
            { value: "after", label: "After" },
          ]}
        />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Icon options</p>
        <SegmentedControl
          className="rounded-md bg-muted"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light", icon: <Sun className="size-3.5" /> },
            { value: "dark", label: "Dark", icon: <Moon className="size-3.5" /> },
            { value: "system", label: "System", icon: <Monitor className="size-3.5" /> },
          ]}
        />
      </div>
    </div>
  );
}
