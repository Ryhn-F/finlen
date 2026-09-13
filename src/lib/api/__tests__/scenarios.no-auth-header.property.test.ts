import { afterEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";
import { getScenario } from "@/lib/api/scenarios";
import { setAuthToken } from "@/lib/api/client";

describe("Feature: roleplay-scenario-detail-flow, Property 5: Scenario API client never attaches an Authorization header", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setAuthToken(null);
  });

  it("issues no Authorization header and completes regardless of stored-token presence", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Either no stored token (`null`) or an arbitrary present token string.
        fc.option(fc.string({ minLength: 1 }), { nil: null }),
        async (storedToken) => {
          setAuthToken(storedToken);

          const capturedInits: (RequestInit | undefined)[] = [];
          const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
            capturedInits.push(init);
            return Promise.resolve(
              new Response(
                JSON.stringify({ id: "valid-scenario-id", title: "Judul Skenario" }),
                { status: 200, headers: { "Content-Type": "application/json" } },
              ),
            );
          });
          vi.stubGlobal("fetch", fetchMock);

          try {
            // The request completes successfully independent of the stored-token state.
            const result = await getScenario("valid-scenario-id");
            expect(result).toBeDefined();
            expect(result.id).toBe("valid-scenario-id");

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const headers = (capturedInits[0]?.headers ?? {}) as Record<string, string>;
            const hasAuthorizationHeader = Object.keys(headers).some(
              (key) => key.toLowerCase() === "authorization",
            );
            expect(hasAuthorizationHeader).toBe(false);
          } finally {
            vi.unstubAllGlobals();
            setAuthToken(null);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
