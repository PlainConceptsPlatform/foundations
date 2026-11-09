import type { Metadata } from "next";
import { StartExperience } from "../../start/start-experience";

export const metadata: Metadata = {
  title: "Add AI to a project",
  description:
    "From a repository with no AI to a Platform repository, one layer at a time: agent-harness, agentic-workflows, project-health and, optionally, Foundations.",
};

export default function Page() {
  return <StartExperience />;
}
