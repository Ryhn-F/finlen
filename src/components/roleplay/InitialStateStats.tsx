"use client";

import { clampInitialStateStat } from "@/lib/utils/scenarioDetail";
import type { SessionStateData } from "@/lib/types/roleplay";

interface InitialStateStatsProps {
  initialState: SessionStateData;
}

interface StatConfig {
  key: "collector_pressure" | "financial_risk" | "trust_level" | "negotiation_power";
  label: string;
}

/**
 * Indonesian labels for the four Initial_State statistics, matching the
 * labels used by `RoleplayStats.tsx` for the same fields during a live
 * session, so a player sees identical stat names on both pages.
 */
const STATS: StatConfig[] = [
  { key: "collector_pressure", label: "Tekanan Penagih" },
  { key: "financial_risk", label: "Risiko Finansial" },
  { key: "trust_level", label: "Tingkat Kepercayaan" },
  { key: "negotiation_power", label: "Kekuatan Negosiasi" },
];

/**
 * Renders the four Initial_State statistics in the Scenario_Detail_Page's
 * right-column briefing panel, each clamped to `[0, 10]` and shown with a
 * fixed "/ 10" bound in the monospace numeral font. `current_stage` is
 * never rendered here.
 *
 * Requirements: 4.8, 4.16, 4.17
 */
export function InitialStateStats({ initialState }: InitialStateStatsProps) {
  return (
    <div className="initial-state-stats">
      {STATS.map(({ key, label }) => {
        const value = clampInitialStateStat(initialState?.[key]);
        return (
          <div key={key} className="initial-state-stat-row">
            <span className="initial-state-stat-label">{label}</span>
            <span className="initial-state-stat-value">
              <span className="font-mono">{value} / 10</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
