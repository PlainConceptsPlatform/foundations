import type { Metadata } from "next";
import { BotsExperience } from "./experience";

export const metadata: Metadata = {
  title: "Enterprise Bots",
  description:
    "Specialists that work in connected systems with your permissions, ask before changes when required, run routines and leave an audit trail.",
};

export default function Page() {
  return <BotsExperience />;
}
