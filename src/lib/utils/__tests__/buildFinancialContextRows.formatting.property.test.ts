import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { buildFinancialContextRows } from "@/lib/utils/scenarioDetail";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import type { ScenarioFinancialContext } from "@/lib/types/roleplay";

/**
 * Builds a single-key `financial_context` object (plus optional `currency`)
 * and returns the single resulting row. `formatRow` is module-private, so
 * formatting is exercised indirectly through `buildFinancialContextRows`.
 */
function buildSingleRow(
  key: string,
  value: number | string,
  currency?: string,
) {
  const context = {
    [key]: value,
    ...(currency !== undefined ? { currency } : {}),
  } as unknown as ScenarioFinancialContext;
  const rows = buildFinancialContextRows(context);
  const row = rows.find((r) => r.key === key);
  if (!row) {
    throw new Error(`Expected a row for key "${key}" but got none: ${JSON.stringify(rows)}`);
  }
  return row;
}

const financeNumberArb = fc.double({ noNaN: true, noDefaultInfinity: true });
const currencyArb = fc.option(fc.constantFrom("IDR", "USD", "EUR"), {
  nil: undefined,
});
// Realistic, non-empty prefixes; since amount/savings/expenses suffixes are
// checked first regardless of prefix content, no further filtering is needed.
const prefixArb = fc.constantFrom(
  "loan",
  "monthly",
  "current",
  "total",
  "user_interest_rate", // deliberately ends in `_rate` before the suffix is appended
  "overdue_months", // deliberately ends in `_months` before the suffix is appended
  "x",
);

describe("Feature: roleplay-scenario-detail-flow, Property 14: Row value formatting is a pure function of key suffix and value type", () => {
  it("formats _amount/_savings/_expenses keys as currency (sub-property A)", () => {
    fc.assert(
      fc.property(
        financeNumberArb,
        prefixArb,
        fc.constantFrom("_amount", "_savings", "_expenses"),
        currencyArb,
        (value, prefix, suffix, currency) => {
          const key = `${prefix}${suffix}`;
          const row = buildSingleRow(key, value, currency);
          expect(row.value).toBe(formatCurrency(value, currency ?? "IDR"));
          expect(row.isNumeric).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("formats _rate keys as a percentage (sub-property B)", () => {
    fc.assert(
      fc.property(financeNumberArb, prefixArb, currencyArb, (value, prefix, currency) => {
        const key = `${prefix}_rate`;
        const row = buildSingleRow(key, value, currency);
        expect(row.value).toBe(formatPercentage(value));
        expect(row.isNumeric).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('formats _months keys as "N bulan" via raw string interpolation (sub-property C)', () => {
    fc.assert(
      fc.property(financeNumberArb, prefixArb, currencyArb, (value, prefix, currency) => {
        const key = `${prefix}_months`;
        const row = buildSingleRow(key, value, currency);
        // The implementation uses a direct template literal (`${value} bulan`),
        // not a locale-formatted number, so match JS's default number-to-string.
        expect(row.value).toBe(`${value} bulan`);
        expect(row.isNumeric).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("formats keys with no matching suffix using Indonesian locale grouping (sub-property D)", () => {
    const nonMatchingKeyArb = fc.constantFrom(
      "user_condition",
      "loan_type",
      "random_field",
      "interest_type",
      "notes",
    );
    fc.assert(
      fc.property(financeNumberArb, nonMatchingKeyArb, currencyArb, (value, key, currency) => {
        const row = buildSingleRow(key, value, currency);
        expect(row.value).toBe(value.toLocaleString("id-ID"));
        expect(row.isNumeric).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("renders string values verbatim regardless of key suffix (sub-property E)", () => {
    const anyKeyArb = fc.constantFrom(
      "loan_amount",
      "interest_rate",
      "repayment_period_months",
      "random_key",
      "current_savings",
      "monthly_essential_expenses",
    );
    const nonEmptyStringArb = fc
      .string({ minLength: 1 })
      .filter((s) => s.trim().length > 0);
    fc.assert(
      fc.property(nonEmptyStringArb, anyKeyArb, currencyArb, (value, key, currency) => {
        const row = buildSingleRow(key, value, currency);
        expect(row.value).toBe(value);
        expect(row.isNumeric).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
