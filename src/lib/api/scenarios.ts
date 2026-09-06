/**
 * FinLen Scenarios API service
 */
import { apiClient } from "./client";
import type { ScenarioDetail, ScenarioListItem } from "../types/roleplay";

export async function getScenarios(): Promise<ScenarioListItem[]> {
  return apiClient<ScenarioListItem[]>("/api/v1/scenarios", {
    method: "GET",
  });
}

export async function getScenario(id: string): Promise<ScenarioDetail> {
  return apiClient<ScenarioDetail>(`/api/v1/scenarios/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}
