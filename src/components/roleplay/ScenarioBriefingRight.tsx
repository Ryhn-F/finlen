"use client";

import { resolveEffectiveMaxTurns } from "@/lib/utils/scenarioDetail";
import type { ScenarioDetail } from "@/lib/types/roleplay";
import { DifficultyBadge } from "./BadgeLabel";
import { FinancialContextRows } from "./FinancialContextRows";
import { InitialStateStats } from "./InitialStateStats";
import { StartSessionButton } from "./StartSessionButton";

interface ScenarioBriefingRightProps {
  scenario: ScenarioDetail;
}

/**
 * Right column of the loaded Scenario_Detail_Page briefing: NPC role,
 * difficulty badge, financial context rows, objective, initial-state
 * stats, the max-turns row, and the Start_Button, rendered inside the
 * Design_System's double-bezel container (outer shell: 32px radius, 8px
 * padding, `var(--surface-strong)`; inner surface: `var(--radius-card)`
 * radius, `var(--surface)`).
 *
 * Requirements: 4.1, 4.2, 4.7, 4.9, 4.10, 4.18, 9.5
 */
export function ScenarioBriefingRight({ scenario }: ScenarioBriefingRightProps) {
  const effectiveMaxTurns = resolveEffectiveMaxTurns(scenario.max_turns);

  return (
    <div className="scenario-briefing-right-shell">
      <div className="scenario-briefing-right-surface">
       

        <DifficultyBadge difficulty={scenario.difficulty} />
         <div className="financial-context-row">
          <span className="financial-context-row-label">Lawan Bicara</span>
          <strong className="financial-context-row-value">{scenario.npc_role}</strong>
        </div>

        <FinancialContextRows financialContext={scenario.financial_context} />

        <InitialStateStats initialState={scenario.initial_state} />

        <div className="financial-context-row">
          <span className="financial-context-row-label">Batas Giliran</span>
          <span className="financial-context-row-value font-mono">
            {effectiveMaxTurns} giliran
          </span>
        </div>

        <StartSessionButton scenario={scenario} />
      </div>
    </div>
  );
}
