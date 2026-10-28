import Link from "next/link";

// The site is a static export on GitHub Pages, so next.config redirects do not exist there.
// /docs/analytics became the Health section; keep old links landing somewhere useful.
const target = "/docs/health";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata = {
  title: "Measuring with Health",
  robots: { index: false },
};

export default function AnalyticsMoved() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-6 py-24">
      <meta httpEquiv="refresh" content={`0; url=${basePath}${target}`} />
      <h1 className="text-2xl font-bold tracking-tight">This page moved</h1>
      <p className="text-muted-foreground">
        Analytics with DORA is now{" "}
        <Link href={target} className="text-primary hover:underline">
          Measuring with Health
        </Link>
        , which covers delivery alongside engineering, agentic adoption and the roadmap.
      </p>
    </main>
  );
}
