"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../api/client";
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
  return useQuery<ScenarioDetail, ApiError>({
    queryKey: SCENARIO_QUERY_KEYS.detail(scenarioId ?? ""),
    queryFn: () => {
      const trimmed = (scenarioId ?? "").trim();
      if (!trimmed) {
        throw new ApiError(0, "Identifier skenario tidak valid.", "Invalid scenario id");
      }
      return getScenario(trimmed);
    },
    enabled: !!scenarioId,
    staleTime: 5 * 60 * 1000, // Requirement 2.6: served from cache for 5 minutes
    retry: false, // automatic retry is handled inside getScenario, not by TanStack Query
  });
}
