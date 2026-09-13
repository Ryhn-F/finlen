import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { clampInitialStateStat } from "@/lib/utils/scenarioDetail";

describe("Feature: roleplay-scenario-detail-flow, Property 15: Initial-state stats are clamped to their displayed bound", () => {
  it("passes through finite numbers within [0, 10] unchanged", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: 0, max: 10 }),
          fc.double({ min: 0, max: 10, noNaN: true }),
        ),
        (value) => {
          expect(clampInitialStateStat(value)).toBe(value);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("clamps finite numbers below 0 to 0", () => {
    fc.assert(
      fc.property(
        fc
          .double({ noNaN: true, noDefaultInfinity: true })
          .filter((n) => n < 0),
        (value) => {
          expect(clampInitialStateStat(value)).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("clamps finite numbers above 10 to 10", () => {
    fc.assert(
      fc.property(
        fc
          .double({ noNaN: true, noDefaultInfinity: true })
          .filter((n) => n > 10),
        (value) => {
          expect(clampInitialStateStat(value)).toBe(10);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns 0 for non-finite, non-numeric, or absent values", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(null),
          fc.constant(NaN),
          fc.constant(Infinity),
          fc.constant(-Infinity),
          fc.string(),
          fc.boolean(),
          fc.array(fc.anything()),
          fc.object(),
        ),
        (value) => {
          expect(clampInitialStateStat(value)).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
