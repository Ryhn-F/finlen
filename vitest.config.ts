import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: true,
    // Property-based tests in this suite (roleplay-scenario-detail-flow)
    // perform many full React Testing Library renders per run (15-30
    // fast-check iterations each). The 5s default is too tight for these
    // under any concurrent load, forcing ad-hoc per-test overrides. Raising
    // the global default gives every DOM-heavy test realistic headroom
    // without each file needing to opt in individually.
    testTimeout: 20000,
    // The default `threads` pool runs all test files sharing one Node
    // process (and its single timer/microtask queue) per worker. Some
    // DOM-heavy property test files in this suite leave a stray pending
    // timer/callback behind after their own file's jsdom environment is
    // torn down (confirmed via an "Uncaught Exception: window is not
    // defined" surfaced from a leaked React render callback while
    // diagnosing this). Under `threads`, that leaked callback still fires
    // on the shared process event loop while a later file is mid-test,
    // which is what was producing the timeouts - not raw CPU contention.
    // The `forks` pool runs each test file in its own OS process, so a
    // leaked callback from one file's environment cannot reach another
    // file's event loop at all.
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 4,
        minForks: 1,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
