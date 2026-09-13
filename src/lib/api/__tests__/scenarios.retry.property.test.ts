import { afterEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";
import { getScenario } from "@/lib/api/scenarios";
import { ApiError } from "@/lib/api/client";

describe("Feature: roleplay-scenario-detail-flow, Property 8: Retry allowance applies only to network/timeout failures and is bounded", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("bounds retries to 3 total attempts for an arbitrarily long streak of transport failures", async () => {
    await fc.assert(
      fc.asyncProperty(
        // How many times fetch would fail if called unboundedly - always >= the
        // fixed 3-attempt cap, so the cap (not the length of the failure streak)
        // is what determines when fetch stops being called.
        fc.integer({ min: 3, max: 6 }),
        async (failureStreakLength) => {
          let callCount = 0;
          const fetchMock = vi.fn(() => {
            callCount += 1;
            if (callCount <= failureStreakLength) {
              return Promise.reject(new TypeError("network error"));
            }
            // Never actually reached while the streak length is >= the retry cap,
            // but included so the mock is a faithful "would keep failing" stand-in.
            return Promise.resolve(
              new Response(JSON.stringify({ id: "scenario-123", title: "Judul" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }),
            );
          });
          vi.stubGlobal("fetch", fetchMock);

          await expect(getScenario("scenario-123")).rejects.toMatchObject({
            status: 0,
          });

          expect(fetchMock).toHaveBeenCalledTimes(3);

          vi.unstubAllGlobals();
        },
      ),
      { numRuns: 50 },
    );
  });

  it("issues zero automatic retries when a failure carries an HTTP status code", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(400, 401, 403, 404, 409, 422, 429, 500, 502, 503),
        async (status) => {
          const fetchMock = vi.fn(() =>
            Promise.resolve(
              new Response(JSON.stringify({ detail: "some error" }), {
                status,
                headers: { "Content-Type": "application/json" },
              }),
            ),
          );
          vi.stubGlobal("fetch", fetchMock);

          let caught: unknown;
          try {
            await getScenario("scenario-123");
          } catch (error) {
            caught = error;
          }

          expect(caught).toBeInstanceOf(ApiError);
          expect((caught as ApiError).status).toBe(status);
          expect(fetchMock).toHaveBeenCalledTimes(1);

          vi.unstubAllGlobals();
        },
      ),
      { numRuns: 40 },
    );
  });

  it("stops retrying as soon as a retry attempt itself hits an HTTP status failure", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(404, 422, 500, 503), async (status) => {
        let callCount = 0;
        const fetchMock = vi.fn(() => {
          callCount += 1;
          if (callCount === 1) {
            // First attempt: transport failure (network error, surfaced as status 0).
            return Promise.reject(new TypeError("network error"));
          }
          // First retry (second call overall): a real HTTP status failure, which
          // must end the retry loop immediately with no third attempt.
          return Promise.resolve(
            new Response(JSON.stringify({ detail: "some error" }), {
              status,
              headers: { "Content-Type": "application/json" },
            }),
          );
        });
        vi.stubGlobal("fetch", fetchMock);

        let caught: unknown;
        try {
          await getScenario("scenario-123");
        } catch (error) {
          caught = error;
        }

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(caught).toBeInstanceOf(ApiError);
        expect((caught as ApiError).status).toBe(status);

        vi.unstubAllGlobals();
      }),
      { numRuns: 30 },
    );
  });

  it("bounds retries to 3 total attempts when every failure is a 10-second-timeout abort", async () => {
    vi.useFakeTimers();
    try {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 3, max: 4 }), async (attemptsToObserve) => {
          let callCount = 0;
          const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
            callCount += 1;
            return new Promise<Response>((_resolve, reject) => {
              // Never settles on its own - only reacts to the AbortSignal that
              // fetchWithTimeoutAndRetry fires after its 10-second per-attempt timeout.
              init?.signal?.addEventListener("abort", () => {
                reject(new DOMException("Aborted", "AbortError"));
              });
            });
          });
          vi.stubGlobal("fetch", fetchMock);

          const pending = getScenario("scenario-123");
          let settled = false;
          pending.catch(() => {
            settled = true;
          });

          // Advance past the 10-second per-attempt timeout enough times to cover
          // every attempt in the fixed 3-attempt budget (and then some, to show
          // the loop still stops at exactly 3 regardless).
          for (let i = 0; i < Math.max(attemptsToObserve, 3); i += 1) {
            await vi.advanceTimersByTimeAsync(10_000);
          }
          await vi.advanceTimersByTimeAsync(0);

          expect(settled).toBe(true);
          await expect(pending).rejects.toMatchObject({ status: 0 });
          expect(fetchMock).toHaveBeenCalledTimes(3);

          vi.unstubAllGlobals();
        }),
        { numRuns: 10 },
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
