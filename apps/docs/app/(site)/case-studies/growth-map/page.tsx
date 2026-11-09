import type { Metadata } from "next";
import { GrowthMapExperience } from "./experience";

export const metadata: Metadata = {
  title: "Growth Map",
  description:
    "A shared framework for self and manager assessments, review agreements, growth actions and campaign history.",
};

export default function Page() {
  return <GrowthMapExperience />;
}
