import { defineConfig } from "vitest/config";

// Unit tests for the package's pure logic, in test/ so the build (tsconfig.json, rootDir src)
// never compiles or publishes them. Coverage floors for the CI gate (`vitest run --coverage` in
// .github/workflows/ci.yml) are measured over every source file, components included, so they
// start low: they sit just under what the suite measured when the gate was added (lines 8.7%,
// statements 8.9%, branches 8.8%, functions 9.2%) and only ever move up.
// Raise them with every tested module, never lower one to go green.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text-summary", "json-summary"],
      thresholds: { lines: 8, statements: 8, branches: 8, functions: 8 },
    },
  },
});
