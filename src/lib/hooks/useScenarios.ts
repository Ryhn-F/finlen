"use client";

import { useQuery } from "@tanstack/react-query";
import { getScenario, getScenarios } from "../api/scenarios";
import type { ScenarioDetail, ScenarioListItem } from "../types/roleplay";

export const SCENARIO_QUERY_KEYS = {
  all: ["scenarios"] as const,
  detail: (id: string) => ["scenarios", id] as const,
};

export function useScenarios() {
  return useQuery<ScenarioListItem[]>({
    queryKey: SCENARIO_QUERY_KEYS.all,
    queryFn: getScenarios,
  });
}

export function useScenario(scenarioId: string | null) {
  return useQuery<ScenarioDetail>({
    queryKey: SCENARIO_QUERY_KEYS.detail(scenarioId || ""),
    queryFn: () => {
      if (!scenarioId) throw new Error("Scenario ID is required");
      return getScenario(scenarioId);
    },
    enabled: !!scenarioId,
  });
}
