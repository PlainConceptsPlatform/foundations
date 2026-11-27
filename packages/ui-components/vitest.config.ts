import { defineConfig } from "vitest/config";

// Coverage floors for the CI gate are measured over the Platform components, not the shadcn
// copies. They only ever move up: raise them with every tested module, never lower one to go green.
const platform = [
  "app-layout",
  "app-sidebar",
  "changelog",
  "cookie-consent",
  "data-table",
  "feature-flags",
  "lib",
  "plain-logo",
  "segmented-control",
  "tour",
];

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/index.ts", ...platform.map((dir) => `src/${dir}/**/*.{ts,tsx}`)],
      reporter: ["text-summary", "json-summary"],
      thresholds: { lines: 8, statements: 8, branches: 8, functions: 8 },
    },
  },
});
