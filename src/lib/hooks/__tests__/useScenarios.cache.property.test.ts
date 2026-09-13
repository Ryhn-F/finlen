import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useScenario } from "@/lib/hooks/useScenarios";
import type { ScenarioDetail } from "@/lib/types/roleplay";

// Hoisted mock: `vi.mock` factories are hoisted above imports, so the mock
// function referenced inside the factory must be created via `vi.hoisted`
// to be available at factory-evaluation time.
const { getScenarioMock } = vi.hoisted(() => ({
  getScenarioMock: vi.fn(),
}));

vi.mock("@/lib/api/scenarios", () => ({
  getScenario: getScenarioMock,
}));

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function buildScenarioDetail(id: string): ScenarioDetail {
  return {
    id,
    title: "Judul Skenario",
    slug: "judul-skenario",
    description: "Deskripsi skenario.",
    category: "debt",
    difficulty: "easy",
    npc_role: "Penagih",
    max_turns: 10,
    financial_context: {},
    objective: "Tujuan pembelajaran.",
    initial_state: {
      collector_pressure: 0,
      financial_risk: 0,
      trust_level: 0,
      negotiation_power: 0,
    },
    created_at: "2024-01-01T00:00:00Z",
    learning_materials: [],
  };
}

/**
 * A fresh `QueryClient` per test case, with `retry` disabled (matching the
 * production `useScenario` behavior of delegating retry to `getScenario`
 * itself) and a `gcTime` far longer than anything advanced in these tests,
 * so garbage collection never interferes with the staleTime behavior under
 * test.
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 60 * 60 * 1000,
      },
    },
  });
}

/**
 * Ids with no leading/trailing whitespace, so the id round-trips through
 * `useScenario`'s `.trim()` guard unchanged - this test targets cache
 * scoping/timing, not the separate whitespace-trimming behavior already
 * covered by other tasks, so ids are constrained to avoid conflating the two.
 */
const scenarioIdArb = fc
  .string({ minLength: 1, maxLength: 24 })
  .filter((s) => s === s.trim() && s.length > 0);

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

/**
 * Drains pending microtasks/timers under fully-manual fake timers (no
 * `shouldAdvanceTime`), so the mocked `getScenario` promise and TanStack
 * Query's internal zero-delay notification scheduling (a real `setTimeout`,
 * captured by the fake clock) get a chance to settle.
 *
 * Each call advances the fake clock by 0ms - it never contributes to the
 * elapsed time tracked by `staleTime`, so calling it any number of times is
 * safe and cannot push a test past the 5-minute boundary. This replaces
 * `waitFor`'s real-wall-clock polling, which is what let real elapsed time
 * leak into the `shouldAdvanceTime`-driven fake clock in the flaky version
 * of this test.
 */
async function flushUntil(predicate: () => boolean, maxIterations = 20): Promise<void> {
  for (let i = 0; i < maxIterations && !predicate(); i += 1) {
    // Wrapped in `act` because advancing fake timers here drives React
    // state updates (the query observer's success state) outside of any
    // React-initiated event handler.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
  }
}

describe("Feature: roleplay-scenario-detail-flow, Property 7: Scenario detail cache is scoped and time-bounded per scenario_id", () => {
  beforeEach(() => {
    getScenarioMock.mockReset();
    getScenarioMock.mockImplementation((id: string) => Promise.resolve(buildScenarioDetail(id)));
    // Fully-manual fake timers, deliberately WITHOUT `shouldAdvanceTime`.
    // `shouldAdvanceTime` ties the fake clock to real wall-clock elapsed
    // time, which let real time spent on DOM render / `waitFor` polling /
    // microtask scheduling leak into the clock alongside the explicit
    // `vi.advanceTimersByTime(offsetMs)` calls below, occasionally pushing
    // the effective elapsed time past the 5-minute boundary near it. With a
    // fully-manual clock, the only advancement is what the test explicitly
    // requests, so `offsetMs` is exactly the elapsed time TanStack Query
    // sees - promise/microtask resolution is instead driven explicitly via
    // `flushUntil` (see above).
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // Explicit per-test timeouts (rather than the 5s default): under the full
  // suite's parallel worker load, real-wall-clock-bound work inside each of
  // the 15 property runs (DOM render + fake-timer flushing) can exceed 5s
  // even though each run is fast in isolation.
  it(
    "serves the cached response with no new request when remounted less than 5 minutes after retrieval",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          scenarioIdArb,
          fc.integer({ min: 0, max: FIVE_MINUTES_MS - 1 }),
          async (scenarioId, offsetMs) => {
            getScenarioMock.mockClear();
            const client = createTestQueryClient();
            const wrapper = createWrapper(client);

            const first = renderHook(() => useScenario(scenarioId), { wrapper });
            await flushUntil(() => first.result.current.isSuccess);
            expect(first.result.current.isSuccess).toBe(true);
            first.unmount();

            await act(async () => {
              await vi.advanceTimersByTimeAsync(offsetMs);
            });

            const second = renderHook(() => useScenario(scenarioId), { wrapper });
            // Served from cache: success and data available on first render,
            // with no loading state and no additional fetch.
            expect(second.result.current.isSuccess).toBe(true);
            expect(second.result.current.isLoading).toBe(false);
            expect(second.result.current.data?.id).toBe(scenarioId);
            second.unmount();

            expect(getScenarioMock).toHaveBeenCalledTimes(1);

            client.clear();
          },
        ),
        { numRuns: 15 },
      );
    },
    20_000,
  );

  it(
    "issues a new request when remounted 5 minutes or more after retrieval",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          scenarioIdArb,
          fc.integer({ min: FIVE_MINUTES_MS, max: FIVE_MINUTES_MS + 60_000 }),
          async (scenarioId, offsetMs) => {
            getScenarioMock.mockClear();
            const client = createTestQueryClient();
            const wrapper = createWrapper(client);

            const first = renderHook(() => useScenario(scenarioId), { wrapper });
            await flushUntil(() => first.result.current.isSuccess);
            expect(first.result.current.isSuccess).toBe(true);
            first.unmount();

            await act(async () => {
              await vi.advanceTimersByTimeAsync(offsetMs);
            });

            const second = renderHook(() => useScenario(scenarioId), { wrapper });
            await flushUntil(() => second.result.current.isSuccess);
            expect(second.result.current.isSuccess).toBe(true);
            second.unmount();

            expect(getScenarioMock).toHaveBeenCalledTimes(2);

            client.clear();
          },
        ),
        { numRuns: 15 },
      );
    },
    20_000,
  );

  it(
    "scopes the cache per scenario_id, never serving one id's data for another",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(scenarioIdArb, { minLength: 2, maxLength: 2 }),
          async ([scenarioIdA, scenarioIdB]) => {
            getScenarioMock.mockClear();
            const client = createTestQueryClient();
            const wrapper = createWrapper(client);

            const first = renderHook(() => useScenario(scenarioIdA), { wrapper });
            await flushUntil(() => first.result.current.isSuccess);
            expect(first.result.current.isSuccess).toBe(true);
            expect(first.result.current.data?.id).toBe(scenarioIdA);
            first.unmount();

            const second = renderHook(() => useScenario(scenarioIdB), { wrapper });
            await flushUntil(() => second.result.current.isSuccess);
            expect(second.result.current.isSuccess).toBe(true);
            expect(second.result.current.data?.id).toBe(scenarioIdB);
            second.unmount();

            expect(getScenarioMock).toHaveBeenCalledTimes(2);
            expect(getScenarioMock).toHaveBeenNthCalledWith(1, scenarioIdA);
            expect(getScenarioMock).toHaveBeenNthCalledWith(2, scenarioIdB);

            client.clear();
          },
        ),
        { numRuns: 15 },
      );
    },
    20_000,
  );
});
