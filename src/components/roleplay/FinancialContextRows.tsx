"use client";

import { buildFinancialContextRows } from "@/lib/utils/scenarioDetail";
import type { ScenarioFinancialContext } from "@/lib/types/roleplay";

interface FinancialContextRowsProps {
  financialContext: ScenarioFinancialContext;
}

/**
 * Renders the ordered, filtered, capped `financial_context` rows in the
 * Scenario_Detail_Page's right-column briefing panel. Every numeric row
 * value is wrapped in the monospace numeral font (Requirement 9.4); string
 * values render verbatim with no extra wrapper.
 *
 * Requirements: 4.3, 4.4, 4.5, 4.6, 4.13, 4.14, 4.15, 9.4
 */
export function FinancialContextRows({ financialContext }: FinancialContextRowsProps) {
  const rows = buildFinancialContextRows(financialContext);

  return (
    <div className="financial-context-rows">
      {rows.map((row) => (
        <div key={row.key} className="financial-context-row">
          <span className="financial-context-row-label">{row.label}</span>
          <span className="financial-context-row-value">
            {row.isNumeric ? <span className="font-mono">{row.value}</span> : row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
