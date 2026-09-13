import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { normalizeScenarioDetail } from "@/lib/api/scenarios";
import { ApiError } from "@/lib/api/client";

/**
 * Arbitrary "missing-like" values for `id`/`title` - anything that isn't a
 * non-empty string, per the implementation's own check:
 * `typeof raw.id === "string" && raw.id.length > 0`.
 */
const missingLikeValue = fc.constantFrom<unknown>(undefined, null, "", 123, {}, []);

/** Arbitrary "other fields" of a raw scenario response, independent of id/title. */
const otherFieldsArbitrary = fc.record(
  {
    slug: fc.string(),
    description: fc.string(),
    category: fc.string(),
    difficulty: fc.string(),
    npc_role: fc.string(),
    financial_context: fc.object(),
    objective: fc.string(),
    initial_state: fc.object(),
    max_turns: fc.oneof(fc.integer(), fc.string(), fc.constant(undefined)),
    created_at: fc.string(),
    learning_materials: fc.oneof(fc.array(fc.object()), fc.constant(undefined)),
  },
  { requiredKeys: [] },
);

function expectMalformedRejection(raw: Record<string, unknown>) {
  let thrown: unknown;
  try {
    normalizeScenarioDetail(raw as never);
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(ApiError);
  const apiError = thrown as ApiError;
  expect(apiError.status).toBe(0);
  expect(apiError.detail).toContain("missing id or title");
}

describe("Feature: roleplay-scenario-detail-flow, Property 9: Malformed scenario responses are rejected without caching", () => {
  // "Does not cache it" is naturally satisfied by this function's contract:
  // a thrown error means no value is ever returned to `getScenario`'s caller,
  // so TanStack Query (in `useScenario`) never has a value to cache. That
  // caller/cache-layer interaction is covered separately by task 4.8's
  // cache-scoping property test; this file only needs to verify the pure
  // validation function itself always throws an `ApiError` for malformed
  // input and never throws for valid input.

  it("throws an ApiError when id is missing-like, regardless of title or other fields", () => {
    fc.assert(
      fc.property(otherFieldsArbitrary, missingLikeValue, fc.string({ minLength: 1 }), (other, badId, title) => {
        const raw = { ...other, id: badId, title };
        expectMalformedRejection(raw);
      }),
      { numRuns: 100 },
    );
  });

  it("throws an ApiError when title is missing-like, regardless of id or other fields", () => {
    fc.assert(
      fc.property(otherFieldsArbitrary, fc.string({ minLength: 1 }), missingLikeValue, (other, id, badTitle) => {
        const raw = { ...other, id, title: badTitle };
        expectMalformedRejection(raw);
      }),
      { numRuns: 100 },
    );
  });

  it("throws an ApiError when both id and title are missing-like, regardless of other fields", () => {
    fc.assert(
      fc.property(otherFieldsArbitrary, missingLikeValue, missingLikeValue, (other, badId, badTitle) => {
        const raw = { ...other, id: badId, title: badTitle };
        expectMalformedRejection(raw);
      }),
      { numRuns: 100 },
    );
  });

  // Negative control: confirms the test harness isn't vacuously true by
  // checking that a response with valid id/title never throws.
  it("does not throw when both id and title are valid non-empty strings", () => {
    const validRaw = {
      id: "scenario-123",
      title: "Judul Skenario",
      slug: "scenario-slug",
      description: "Deskripsi skenario",
      category: "debt",
      difficulty: "easy",
      npc_role: "Debt Collector",
      max_turns: 10,
      financial_context: {},
      objective: "Negotiate a payment plan",
      initial_state: {},
      created_at: "2024-01-01T00:00:00Z",
      learning_materials: [],
    };

    expect(() => normalizeScenarioDetail(validRaw as never)).not.toThrow();
  });
});
