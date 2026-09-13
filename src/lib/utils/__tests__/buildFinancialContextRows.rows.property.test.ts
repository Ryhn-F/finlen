import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  buildFinancialContextRows,
  isRenderableValue,
} from "@/lib/utils/scenarioDetail";
import type { ScenarioFinancialContext } from "@/lib/types/roleplay";

/**
 * Mirrors the private `ORDERED_KEYS` list in `scenarioDetail.ts` (not exported).
 * Kept in lockstep with the design document's fixed eight `financial_context`
 * keys and their guaranteed relative order.
 */
const ORDERED_KEYS = [
  "loan_amount",
  "interest_rate",
  "interest_type",
  "repayment_period_months",
  "overdue_months",
  "user_condition",
  "current_savings",
  "monthly_essential_expenses",
] as const;

const MAX_ROWS = 12;

// A key name guaranteed to never collide with an `ORDERED_KEYS` entry or `currency`.
const extraKeyNameArb = fc
  .string({ minLength: 1, maxLength: 10 })
  .filter(
    (s) =>
      s.trim().length > 0 &&
      s !== "currency" &&
      !(ORDERED_KEYS as readonly string[]).includes(s),
  );

// Renderable finite numbers (any finite double, including 0/negatives).
const renderableNumberArb = fc.double({ noNaN: true, noDefaultInfinity: true });
// Non-renderable numbers: NaN and both infinities.
const nonRenderableNumberArb = fc.constantFrom(NaN, Infinity, -Infinity);
// Renderable strings: non-empty after trimming.
const renderableStringArb = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0);
// Non-renderable strings: empty or whitespace-only.
const nonRenderableStringArb = fc.constantFrom("", "   ", "\t", "\n", "  \n\t ");

/** A mixed generator covering both renderable and non-renderable value shapes. */
const valueArb = fc.oneof(
  renderableNumberArb,
  nonRenderableNumberArb,
  renderableStringArb,
  nonRenderableStringArb,
  fc.constant(null),
  fc.boolean(),
  fc.array(fc.anything(), { maxLength: 3 }),
  fc.object(),
);

/**
 * Builds a plain object whose keys are: a random subset of the eight fixed
 * `ORDERED_KEYS` (in an arbitrary insertion order, to prove insertion order
 * of those keys doesn't matter) plus 0-5 arbitrary "extra" keys, all
 * interleaved in a random final insertion order (so the object's actual
 * `Object.keys` order is the source of truth for "remaining key order"),
 * plus an optional `currency` key spliced in at a random position.
 */
const contextArb = fc
  .tuple(
    fc.shuffledSubarray(ORDERED_KEYS as unknown as string[], {
      minLength: 0,
      maxLength: ORDERED_KEYS.length,
    }),
    fc.uniqueArray(extraKeyNameArb, { minLength: 0, maxLength: 5 }),
  )
  .chain(([orderedSubset, extraKeys]) => {
    const allKeys = [...orderedSubset, ...extraKeys];
    return fc.shuffledSubarray(allKeys, {
      minLength: allKeys.length,
      maxLength: allKeys.length,
    });
  })
  .chain((keys) =>
    fc
      .tuple(
        fc.array(valueArb, { minLength: keys.length, maxLength: keys.length }),
        fc.option(fc.string({ minLength: 1, maxLength: 8 }), { nil: undefined }),
        fc.nat({ max: keys.length }),
      )
      .map(([values, currencyValue, currencyIndex]) => {
        const entries: [string, unknown][] = keys.map((k, i) => [k, values[i]]);
        if (currencyValue !== undefined) {
          entries.splice(currencyIndex, 0, ["currency", currencyValue]);
        }
        return Object.fromEntries(entries) as unknown as ScenarioFinancialContext;
      }),
  );

describe("Feature: roleplay-scenario-detail-flow, Property 13: Financial context rows are exactly the renderable, ordered, capped set", () => {
  it("returns exactly the renderable, ordered, capped rows for any financial_context shape", () => {
    fc.assert(
      fc.property(contextArb, (context) => {
        const rows = buildFinancialContextRows(context);
        const outputKeys = rows.map((r) => r.key);

        // `currency` is never rendered as its own row.
        for (const row of rows) {
          expect(row.key).not.toBe("currency");
        }

        // Every rendered row's underlying value is renderable.
        for (const row of rows) {
          expect(isRenderableValue(context[row.key as keyof ScenarioFinancialContext])).toBe(
            true,
          );
        }

        // Output size is exactly min(12, number of renderable non-currency keys).
        const renderableNonCurrencyKeys = Object.keys(context).filter(
          (k) => k !== "currency" && isRenderableValue(context[k as keyof ScenarioFinancialContext]),
        );
        expect(rows.length).toBe(Math.min(MAX_ROWS, renderableNonCurrencyKeys.length));

        // Below the cap, every renderable non-currency key must be present.
        if (rows.length < MAX_ROWS) {
          for (const key of renderableNonCurrencyKeys) {
            expect(outputKeys).toContain(key);
          }
        }

        // Ordering: partition output keys into "fixed-order" and "remaining".
        const orderedIndices: number[] = [];
        const remainingIndices: number[] = [];
        outputKeys.forEach((key, idx) => {
          if ((ORDERED_KEYS as readonly string[]).includes(key)) {
            orderedIndices.push(idx);
          } else {
            remainingIndices.push(idx);
          }
        });

        // The fixed-order subsequence must follow ORDERED_KEYS's relative order.
        const orderedOutputKeys = orderedIndices.map((i) => outputKeys[i]);
        const expectedOrderedSubsequence = ORDERED_KEYS.filter((k) =>
          orderedOutputKeys.includes(k),
        );
        expect(orderedOutputKeys).toEqual(expectedOrderedSubsequence);

        // The remaining-key subsequence must follow the object's own key order.
        const remainingOutputKeys = remainingIndices.map((i) => outputKeys[i]);
        const objectOrderRemainingKeys = Object.keys(context).filter(
          (k) =>
            k !== "currency" &&
            !(ORDERED_KEYS as readonly string[]).includes(k) &&
            remainingOutputKeys.includes(k),
        );
        expect(remainingOutputKeys).toEqual(objectOrderRemainingKeys);

        // Every fixed-order row precedes every remaining-key row.
        if (orderedIndices.length > 0 && remainingIndices.length > 0) {
          const lastOrderedIndex = Math.max(...orderedIndices);
          const firstRemainingIndex = Math.min(...remainingIndices);
          expect(lastOrderedIndex).toBeLessThan(firstRemainingIndex);
        }
      }),
      { numRuns: 100 },
    );
  });
});
