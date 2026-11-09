import { ArrowRight } from "lucide-react";

const STEPS = [
  ["Architecture review", "Review your stack and its risks with the architects."],
  ["Pilot", "Build and test one useful slice in weeks."],
  ["Production", "Release to your cloud, with your guardrails and your code."],
] as const;

export function CaseStudyCta({ title, body }: { title: string; body: string }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">{body}</p>

        <ol className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-3 md:gap-12">
          {STEPS.map(([name, detail]) => (
            <li key={name}>
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </li>
          ))}
        </ol>

        <a
          href="/case-studies/add-ai-to-a-project"
          data-tool-name="see_how_we_build"
          data-tool-description="Navigate to the Add AI to a project case study, which explains how Platform delivers these systems"
          className="group mt-12 inline-flex items-center gap-3 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          See how we build this
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
          />
        </a>
      </div>
    </section>
  );
}
