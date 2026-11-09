"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PlainLogo } from "@plainconceptsplatform/ui-components";
import { SearchToggle } from "fumadocs-ui/components/layout/search-toggle";
import { ThemeToggle } from "fumadocs-ui/components/layout/theme-toggle";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CASE_STUDIES } from "./cases";

const NAV_LINK =
  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CaseStudyMenu({ active = false }: { active?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          NAV_LINK,
          "inline-flex items-center gap-1",
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        Case Studies
        <ChevronDown aria-hidden className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] p-1.5"
        data-tool-name="navigate_to_case_study"
        data-tool-description="Navigate to one of the case studies"
      >
        {CASE_STUDIES.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              data-tool-param-description={`Open the ${item.title} case study: ${item.blurb}`}
              className="flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors duration-150"
            >
              <span className="text-sm font-medium text-foreground">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.blurb}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CaseStudyNav() {
  const pathname = usePathname();
  const here = CASE_STUDIES.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const inCaseStudies = pathname.startsWith("/case-studies");

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="block w-8 shrink-0">
            <PlainLogo />
          </span>
          <span className="hidden font-semibold sm:inline">Platform</span>
        </Link>

        <span aria-hidden className="ml-1 hidden text-sm text-muted-foreground lg:inline">
          <span className={cn(here || inCaseStudies ? "text-foreground" : "")}>/ Case Studies</span>
          {here ? ` / ${here.title}` : ""}
        </span>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <CaseStudyMenu active={inCaseStudies} />

          <Link
            href="/docs"
            className={cn(
              NAV_LINK,
              "hidden text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex",
            )}
          >
            Documentation
          </Link>

          <SearchToggle hideIfDisabled />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
