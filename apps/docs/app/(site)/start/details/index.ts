import { FOUNDATIONS_GUIDES } from "./foundations";
import { HARNESS_GUIDES } from "./harness";
import { HEALTH_GUIDES } from "./health";
import type { StepGuide } from "./types";
import { WORKFLOWS_GUIDES } from "./workflows";

/** One list per layer, in the same order as `PILLARS` and their steps. */
const GUIDES: StepGuide[][] = [HARNESS_GUIDES, WORKFLOWS_GUIDES, HEALTH_GUIDES, FOUNDATIONS_GUIDES];

export function guideFor(pillar: number, step: number): StepGuide | undefined {
  return GUIDES[pillar]?.[step];
}

export type { CodeSample, GuideSection, StepGuide } from "./types";
