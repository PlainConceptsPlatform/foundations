import { baseOptions } from "@/app/layout.config";
import { SearchToggle } from "fumadocs-ui/components/layout/search-toggle";
import { ThemeToggle } from "fumadocs-ui/components/layout/theme-toggle";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { CaseStudyMenu } from "../case-studies/_shared/nav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      nav={{ ...baseOptions.nav, children: <CaseStudyMenu /> }}
      // Below lg, Fumadocs keeps the theme toggle inside the collapsed menu, where people
      // did not find it. The small-screen search slot sits in the bar itself, so the
      // toggle rides along with search there.
      searchToggle={{
        components: {
          sm: (
            <>
              <SearchToggle className="p-2" hideIfDisabled />
              <ThemeToggle />
            </>
          ),
        },
      }}
    >
      {children}
    </HomeLayout>
  );
}
