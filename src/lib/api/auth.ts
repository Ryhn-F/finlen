/**
 * FinLen Auth API service
 */
import { apiClient, setAuthToken } from "./client";
import type { LoginResponse, UserResponse } from "../types/roleplay";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<UserResponse> {
  return apiClient<UserResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiClient<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function getMe(token?: string | null): Promise<UserResponse> {
  return apiClient<UserResponse>("/api/v1/auth/me", {
    method: "GET",
    token,
    requiresAuth: true,
  });
}

export function logout(): void {
  setAuthToken(null);
}
