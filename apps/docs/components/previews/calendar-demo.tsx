"use client";

import { Calendar } from "@plainconceptsplatform/ui-components/calendar";
import * as React from "react";

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
  );
}
