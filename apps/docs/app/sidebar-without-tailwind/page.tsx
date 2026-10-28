import type { Metadata } from "next";
import { SidebarWithoutTailwindDemo } from "./sidebar-without-tailwind-demo";
import "./sidebar-without-tailwind.css";

export const metadata: Metadata = {
  title: "AppSidebar without Tailwind",
  description:
    "The sidebar rendered against a stylesheet that compiles the theme and utilities layers only, with consumer globals in layer(base) and no preflight.",
};

export default function Page() {
  return <SidebarWithoutTailwindDemo />;
}
