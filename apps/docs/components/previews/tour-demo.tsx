"use client";

import { Tour, requestTour, tourAnchor } from "@plainconceptsplatform/ui-components/tour";
import type { TourStep } from "@plainconceptsplatform/ui-components/tour";
import { ChartLine, PanelsTopLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const TOUR_ID = "docs-demo-v1";

const STEPS: TourStep[] = [
  {
    icon: <Sparkles size={22} strokeWidth={1.75} />,
    title: "Welcome to the new app",
    description:
      "A step with no anchor sits mid-screen. Use it to say hello and to close the tour.",
  },
  {
    anchor: "demo-nav",
    icon: <PanelsTopLeft size={22} strokeWidth={1.75} />,
    title: "Point at anything",
    description: "Add data-tour to an element and name it in a step. The popover follows it.",
  },
  {
    anchor: "demo-insights",
    icon: <ChartLine size={22} strokeWidth={1.75} />,
    title: "Missing anchors are skipped",
    description:
      "A step whose element is not on the page is left out, so one tour can serve several roles.",
  },
];

const TEXTS = {
  next: "Next",
  back: "Back",
  done: "Done",
  skip: "Skip tour",
  close: "Close the tour",
  progress: "{{current}} of {{total}}",
};

export function TourDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      {/* enabled is off here: the docs page should not take over on load, the button starts it. */}
      <Tour id={TOUR_ID} steps={STEPS} texts={TEXTS} enabled={false} />
      <nav className="flex gap-2" {...tourAnchor("demo-nav")}>
        <Button variant="ghost" size="sm">
          Projects
        </Button>
        <Button variant="ghost" size="sm" {...tourAnchor("demo-insights")}>
          Insights
        </Button>
      </nav>
      <div>
        <Button onClick={() => requestTour(TOUR_ID)}>Take the tour</Button>
      </div>
    </div>
  );
}
