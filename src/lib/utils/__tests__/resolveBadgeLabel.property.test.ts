import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  resolveBadgeLabel,
} from "@/lib/utils/scenarioDetail";

describe("Feature: roleplay-scenario-detail-flow, Property 11: Badge labels map known values to Indonesian text and pass through unknown values", () => {
  it("maps every known category key to its Indonesian label", () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(CATEGORY_LABELS)), (key) => {
        const result = resolveBadgeLabel(CATEGORY_LABELS, key);
        expect(result).toBe(CATEGORY_LABELS[key]);
        expect(result.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it("maps every known difficulty key to its Indonesian label", () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(DIFFICULTY_LABELS)), (key) => {
        const result = resolveBadgeLabel(DIFFICULTY_LABELS, key);
        expect(result).toBe(DIFFICULTY_LABELS[key]);
        expect(result.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it("passes through unknown category values verbatim", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1 })
          .filter((s) => s.trim().length > 0 && !(s in CATEGORY_LABELS)),
        (rawValue) => {
          const result = resolveBadgeLabel(CATEGORY_LABELS, rawValue);
          expect(result).toBe(rawValue);
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("passes through unknown difficulty values verbatim", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1 })
          .filter((s) => s.trim().length > 0 && !(s in DIFFICULTY_LABELS)),
        (rawValue) => {
          const result = resolveBadgeLabel(DIFFICULTY_LABELS, rawValue);
          expect(result).toBe(rawValue);
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
