import type { ReactNode } from "react";
import { CaseStudyNav } from "./_shared/nav";

/**
 * Every case study is a full-screen piece under this group, the same way /start
 * sits under (site): no fumadocs navbar, just the shared case-studies header and
 * the page it carries.
 */
export default function CaseStudiesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <CaseStudyNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
