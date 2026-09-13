/**
 * Pure-function utilities backing the Scenario Detail briefing page
 * (`/app/roleplay/scenario/[scenario_id]`).
 *
 * This module intentionally contains no React/JSX so its logic can be
 * unit- and property-tested independent of rendering.
 */

import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import type { ScenarioFinancialContext } from "@/lib/types/roleplay";

/**
 * Indonesian labels for the `category` badge on the Scenario Detail page.
 * Mirrors the labels previously duplicated ad hoc in `ScenarioSelector.tsx`
 * (the `CATEGORIES` filter list) and `ScenarioCard.tsx`.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  debt: "Utang & Pinjol",
  spending: "Pengeluaran & Paylater",
  fraud: "Penipuan Investasi",
  emergency: "Dana Darurat",
  social: "Tekanan Sosial",
};

/**
 * Indonesian labels for the `difficulty` badge on the Scenario Detail page.
 * Hoisted from `getDifficultyLabel` in `ScenarioCard.tsx`.
 */
export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "MUDAH",
  medium: "MENENGAH",
  hard: "SULIT",
};

/**
 * Resolves the display label for a badge value using a lookup map,
 * falling back to the raw value verbatim when the map has no entry for it.
 *
 * Requirements: 3.3, 3.14, 4.2
 */
export function resolveBadgeLabel(
  map: Record<string, string>,
  rawValue: string,
): string {
  return map[rawValue] ?? rawValue;
}

/**
 * The eight `financial_context` keys that receive a fixed Indonesian label
 * and a guaranteed position at the top of the rendered rows, in this order.
 * Any remaining keys follow in their original `financial_context` order.
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

const FIXED_LABELS: Record<string, string> = {
  loan_amount: "Jumlah Pinjaman",
  interest_rate: "Suku Bunga",
  interest_type: "Jenis Bunga",
  repayment_period_months: "Jangka Waktu Pelunasan",
  overdue_months: "Bulan Menunggak",
  user_condition: "Kondisi Pemain",
  current_savings: "Tabungan Saat Ini",
  monthly_essential_expenses: "Pengeluaran Wajib Bulanan",
};

/** Maximum number of `financial_context` rows rendered on the Scenario Detail page. */
const MAX_FINANCIAL_CONTEXT_ROWS = 12;

export interface FinancialContextRow {
  key: string;
  label: string;
  value: string;
  isNumeric: boolean;
}

/**
 * Guards a raw `financial_context` value as renderable: a finite number, or
 * a non-empty (after trimming) string. Everything else (`null`, `undefined`,
 * `NaN`, booleans, objects, empty/whitespace-only strings) is not renderable.
 *
 * Requirements: 4.15
 */
export function isRenderableValue(v: unknown): v is number | string {
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") return v.trim().length > 0;
  return false;
}

/**
 * Builds the ordered, filtered, capped list of rows to render for a
 * scenario's `financial_context`, excluding `currency` (which is used only
 * as formatting metadata for amount-like rows, never rendered as its own row).
 *
 * Requirements: 4.3, 4.15
 */
export function buildFinancialContextRows(
  context: ScenarioFinancialContext,
): FinancialContextRow[] {
  const keys = Object.keys(context).filter((k) => k !== "currency");
  const ordered = [
    ...ORDERED_KEYS.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !ORDERED_KEYS.includes(k as (typeof ORDERED_KEYS)[number])),
  ];

  return ordered
    .map((key) => [key, context[key as keyof ScenarioFinancialContext] as unknown] as const)
    .filter(([, value]) => isRenderableValue(value))
    .slice(0, MAX_FINANCIAL_CONTEXT_ROWS)
    .map(([key, value]) => formatRow(key, value as number | string, context.currency));
}

/**
 * Formats a single `financial_context` entry into a display row.
 *
 * String values always render verbatim, regardless of key suffix (Req 4.14).
 * Numeric values are formatted based on the key's suffix, checked in this
 * order: `_amount`/`_savings`/`_expenses` -> currency, `_rate` -> percentage,
 * `_months` -> "N bulan", else Indonesian locale grouping (Req 4.4-4.6, 4.13).
 *
 * Requirements: 4.3, 4.4, 4.5, 4.6, 4.13, 4.14
 */
function formatRow(
  key: string,
  value: number | string,
  currency: string | null | undefined,
): FinancialContextRow {
  const label = FIXED_LABELS[key] ?? key.replace(/_/g, " ");

  if (typeof value === "string") {
    return { key, label, value, isNumeric: false };
  }

  if (/_amount$|_savings$|_expenses$/.test(key)) {
    return {
      key,
      label,
      value: formatCurrency(value, currency ?? "IDR"),
      isNumeric: true,
    };
  }

  if (/_rate$/.test(key)) {
    return { key, label, value: formatPercentage(value), isNumeric: true };
  }

  if (/_months$/.test(key)) {
    return { key, label, value: `${value} bulan`, isNumeric: true };
  }

  return { key, label, value: value.toLocaleString("id-ID"), isNumeric: true };
}

/**
 * Clamps a raw `Initial_State` statistic (e.g. `collector_pressure`,
 * `financial_risk`, `trust_level`, `negotiation_power`) to the displayed
 * `[0, 10]` range. Finite numbers outside the range are pulled to the
 * nearest bound; non-numeric or absent values display as `0`.
 *
 * Requirements: 4.16, 4.17
 */
export function clampInitialStateStat(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(10, Math.max(0, value));
}

/**
 * Resolves the effective `max_turns` value to display: the value itself
 * when it is an integer between 1 and 50 inclusive, otherwise the fallback
 * of 10 (rendered with the Indonesian unit `giliran`).
 *
 * Requirements: 4.18
 */
export function resolveEffectiveMaxTurns(value: unknown): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 50
    ? value
    : 10;
}
