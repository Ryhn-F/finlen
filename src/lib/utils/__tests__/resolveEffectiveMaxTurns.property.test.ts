import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { resolveEffectiveMaxTurns } from "@/lib/utils/scenarioDetail";

describe("Feature: roleplay-scenario-detail-flow, Property 16: Effective max turns falls back to 10 outside its valid range", () => {
  it("returns integers in [1, 50] unchanged", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (value) => {
        expect(resolveEffectiveMaxTurns(value)).toBe(value);
      }),
      { numRuns: 100 },
    );
  });

  it("falls back to 10 for integers outside [1, 50]", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: -1000, max: 0 }),
          fc.integer({ min: 51, max: 1000 }),
        ),
        (value) => {
          expect(resolveEffectiveMaxTurns(value)).toBe(10);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("falls back to 10 for non-integer finite numbers", () => {
    fc.assert(
      fc.property(
        fc
          .double({ noNaN: true, noDefaultInfinity: true })
          .filter((n) => !Number.isInteger(n)),
        (value) => {
          expect(resolveEffectiveMaxTurns(value)).toBe(10);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("falls back to 10 for non-numeric or absent values", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(null),
          fc.string(),
          fc.boolean(),
          fc.array(fc.anything()),
          fc.object(),
          fc.constant(NaN),
          fc.constant(Infinity),
          fc.constant(-Infinity),
        ),
        (value) => {
          expect(resolveEffectiveMaxTurns(value)).toBe(10);
        },
      ),
      { numRuns: 100 },
    );
  });
});
