import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CASE_STUDIES } from "./_shared/cases";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "Four Platform builds, with the technical decisions and product screens behind them.",
};

export default function CaseStudiesIndex() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl">
        Case studies
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Read how each system works and inspect the screens that teams use.
      </p>

      <ul
        className="mt-16 divide-y divide-border border-t border-border"
        data-tool-name="open_case_study"
        data-tool-description="Navigate to one of the four case studies; each link opens the full case study page"
      >
        {CASE_STUDIES.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              data-tool-param-description={`Open the ${item.title} case study: ${item.blurb}`}
              className="group flex items-center gap-5 py-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-14"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-2xl font-semibold tracking-tight text-foreground transition-colors duration-150 group-hover:text-primary sm:text-3xl">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{item.blurb}</span>
              </span>
              <ChevronRight
                aria-hidden
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
