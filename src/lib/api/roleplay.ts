/**
 * FinLen Roleplay API service
 */
import { apiClient } from "./client";
import type {
  CompleteSessionResponse,
  CreateSessionResponse,
  RoleplayMessageItem,
  RoleplaySessionDetail,
  SendMessageResponse,
} from "../types/roleplay";

export async function createRoleplaySession(
  scenarioId: string,
): Promise<CreateSessionResponse> {
  return apiClient<CreateSessionResponse>("/api/v1/roleplay/sessions", {
    method: "POST",
    requiresAuth: true,
    body: JSON.stringify({ scenario_id: scenarioId }),
  });
}

export async function getRoleplaySession(
  sessionId: string,
): Promise<RoleplaySessionDetail> {
  return apiClient<RoleplaySessionDetail>(
    `/api/v1/roleplay/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );
}

export async function getRoleplayMessages(
  sessionId: string,
  options?: { limit?: number; offset?: number },
): Promise<RoleplayMessageItem[]> {
  const query = new URLSearchParams();
  if (options?.limit) query.set("limit", String(options.limit));
  if (options?.offset) query.set("offset", String(options.offset));
  const queryString = query.toString() ? `?${query.toString()}` : "";

  return apiClient<RoleplayMessageItem[]>(
    `/api/v1/roleplay/sessions/${encodeURIComponent(sessionId)}/messages${queryString}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );
}

export async function sendRoleplayMessage(
  sessionId: string,
  message: string,
): Promise<SendMessageResponse> {
  return apiClient<SendMessageResponse>(
    `/api/v1/roleplay/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify({ message }),
    },
  );
}

export async function completeRoleplaySession(
  sessionId: string,
): Promise<CompleteSessionResponse> {
  return apiClient<CompleteSessionResponse>(
    `/api/v1/roleplay/sessions/${encodeURIComponent(sessionId)}/complete`,
    {
      method: "POST",
      requiresAuth: true,
    },
  );
}
