import type { Metadata } from "next";
import { StartExperience } from "./start-experience";

/**
 * Where "Start a project" on the home page leads: the journey from a repository with no
 * AI to everything a Platform repository has, drawn as a tower that grows one layer per
 * pillar. It sits outside the home and docs layouts on purpose, as a full-screen piece.
 *
 * It is also a deliberate exception to the motion contract in ai/DESIGN.md, scoped to
 * this route and nowhere else. Layers drop in over 700ms and a shortcut lights a whole
 * layer as a cascade, because seeing the repository grow is the point of the page. The
 * rest of the contract still holds: only transform, opacity and colour move, every
 * transition follows a click or a key, and `prefers-reduced-motion` turns all of it off.
 * Do not carry these durations into other pages.
 */
export const metadata: Metadata = {
  title: "Start a project",
  description:
    "From a repository with no AI to a Platform repository, one layer at a time: agent-harness, agentic-workflows, project-health and, optionally, Foundations.",
};

export default function Page() {
  return <StartExperience />;
}
