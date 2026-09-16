/**
 * FinLen Roleplay API service
 */
import { apiClient, ApiError } from "./client";
import type {
  CompleteSessionResponse,
  CreateSessionResponse,
  RoleplayHistoryDetail,
  RoleplayHistoryOptions,
  RoleplayHistoryResponse,
  RoleplayMessageItem,
  RoleplayProgressionResponse,
  RoleplaySessionDetail,
  SendMessageResponse,
} from "../types/roleplay";

const CREATE_SESSION_TIMEOUT_MS = 30_000;

export async function createRoleplaySession(
  scenarioId: string,
): Promise<CreateSessionResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CREATE_SESSION_TIMEOUT_MS);

  try {
    return await apiClient<CreateSessionResponse>("/api/v1/roleplay/sessions", {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify({ scenario_id: scenarioId }),
      signal: controller.signal,
    });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new ApiError(
        0,
        "Sesi tidak dapat dimulai. Silakan coba lagi.",
        "Request timed out after 30s",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
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

export async function getRoleplayHistory(
  options: RoleplayHistoryOptions = {},
): Promise<RoleplayHistoryResponse> {
  const query = new URLSearchParams();
  if (options.limit !== undefined) query.set("limit", String(options.limit));
  if (options.offset !== undefined) query.set("offset", String(options.offset));
  const queryString = query.toString() ? `?${query.toString()}` : "";

  return apiClient<RoleplayHistoryResponse>(
    `/api/v1/roleplay/history${queryString}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );
}

export async function getRoleplayHistoryDetail(
  sessionId: string,
): Promise<RoleplayHistoryDetail> {
  return apiClient<RoleplayHistoryDetail>(
    `/api/v1/roleplay/history/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );
}

export async function getRoleplayProgression(
  limit = 100,
): Promise<RoleplayProgressionResponse> {
  const query = new URLSearchParams({ limit: String(limit) });

  return apiClient<RoleplayProgressionResponse>(
    `/api/v1/roleplay/history/progression?${query.toString()}`,
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
