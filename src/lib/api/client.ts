/**
 * FinLen Central API Client
 * Normalizes HTTP requests, handles Bearer auth headers, and maps API errors to Indonesian messages.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "finlen_access_token";

export class ApiError extends Error {
  status: number;
  detail?: string;
  userMessage: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.userMessage = message;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota or access errors
  }
}

function resolveUserErrorMessage(status: number, detail?: string): string {
  if (detail && typeof detail === "string") {
    // Check for specific backend messages and translate if necessary
    if (detail.includes("Cannot send messages to a 'completed' session")) {
      return "Sesi roleplay ini sudah selesai. Kamu tidak dapat mengirim pesan lagi.";
    }
    if (detail.includes("Invalid email or password")) {
      return "Email atau kata sandi tidak cocok. Silakan periksa kembali.";
    }
    if (detail.includes("Email already registered")) {
      return "Email sudah terdaftar. Silakan gunakan email lain atau masuk.";
    }
    if (detail.includes("Username already taken")) {
      return "Nama pengguna sudah digunakan. Pilih nama lain.";
    }
    if (detail.includes("Session is already completed")) {
      return "Sesi ini telah diselesaikan sebelumnya.";
    }
  }

  switch (status) {
    case 400:
      return detail || "Permintaan tidak dapat diproses.";
    case 401:
      return "Sesi login kedaluwarsa atau kamu belum masuk. Silakan masuk terlebih dahulu.";
    case 403:
      return "Akses ditolak. Skenario atau sesi ini bukan milik akunmu.";
    case 404:
      return "Data atau skenario tidak ditemukan.";
    case 409:
      return "Data sudah terdaftar atau terjadi konflik pada sistem.";
    case 422:
      return "Format data yang dikirim tidak valid. Mohon periksa kembali.";
    case 429:
      return "Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa saat.";
    case 500:
      return "Terjadi kendala pada server backend. Coba beberapa saat lagi.";
    case 503:
      return "Layanan AI sedang sibuk atau tidak tersedia. Coba lagi dalam beberapa saat.";
    default:
      return detail || `Terjadi kesalahan pada sistem (Kode: ${status}).`;
  }
}

export interface ApiClientOptions extends RequestInit {
  token?: string | null;
  requiresAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { token, requiresAuth = false, headers = {}, ...restOptions } = options;

  // Ensure path starts with /api/v1 if not already
  const normalizedEndpoint = endpoint.startsWith("/api/v1")
    ? endpoint
    : `/api/v1${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const fullUrl = `${BASE_URL.replace(/\/$/, "")}${normalizedEndpoint}`;

  const resolvedToken = token !== undefined ? token : getAuthToken();

  if (requiresAuth && !resolvedToken) {
    throw new ApiError(
      401,
      "Kamu perlu masuk ke akun FinLen untuk melanjutkan roleplay.",
      "Missing authorization token",
    );
  }

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    ...(headers as Record<string, string>),
  };

  if (!(restOptions.body instanceof FormData) && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...restOptions,
      headers: requestHeaders,
    });
  } catch (networkError) {
    const errorMsg =
      networkError instanceof Error ? networkError.message : "Network error";
    throw new ApiError(
      0,
      "Tidak dapat terhubung ke server backend FinLen. Pastikan backend di port 8000 sedang berjalan.",
      errorMsg,
    );
  }

  if (!response.ok) {
    let errorDetail: string | undefined;
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === "string") {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail
          .map((item: { msg?: string }) => item.msg || "")
          .filter(Boolean)
          .join(", ");
      }
    } catch {
      // Body not JSON
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = undefined;
      }
    }

    const userMessage = resolveUserErrorMessage(response.status, errorDetail);
    throw new ApiError(response.status, userMessage, errorDetail);
  }

  // Check 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
