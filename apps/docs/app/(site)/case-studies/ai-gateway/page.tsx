import type { Metadata } from "next";
import { GatewayExperience } from "./experience";

export const metadata: Metadata = {
  title: "Custom AI Gateway",
  description:
    "A custom gateway that authenticates requests, enforces access, routes across upstream providers and records usage and cost.",
};

export default function Page() {
  return <GatewayExperience />;
}
