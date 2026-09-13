/**
 * FinLen Scenarios API service
 */
import { apiClient, ApiError } from "./client";
import type {
  LearningMaterialItem,
  ScenarioDetail,
  ScenarioFinancialContext,
  ScenarioListItem,
  SessionStateData,
} from "../types/roleplay";

/**
 * Untrusted, unvalidated shape of a `GET /api/v1/scenarios/{id}` response body.
 * Every field is `unknown` because the network response has not been checked
 * yet - `normalizeScenarioDetail` is the single place that performs that
 * runtime validation before the data is treated as a `ScenarioDetail`.
 */
interface RawLearningMaterialItem {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  formal_file_url?: unknown;
  brainrot_file_url?: unknown;
  source_name?: unknown;
  source_url?: unknown;
  created_at?: unknown;
}

interface RawScenarioDetailResponse {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  category?: unknown;
  difficulty?: unknown;
  npc_role?: unknown;
  max_turns?: unknown;
  financial_context?: unknown;
  objective?: unknown;
  initial_state?: unknown;
  created_at?: unknown;
  learning_materials?: unknown;
}

export async function getScenarios(): Promise<ScenarioListItem[]> {
  return apiClient<ScenarioListItem[]>("/api/v1/scenarios", {
    method: "GET",
  });
}

interface FetchWithTimeoutAndRetryOptions {
  /** Abort the in-flight attempt if it hasn't settled within this many milliseconds. */
  timeoutMs: number;
  /** Total number of attempts, including the first one (i.e. 1 + number of retries). */
  maxAttempts: number;
}

/**
 * Wraps a request-issuing function with a per-attempt timeout (via
 * `AbortController`) and a bounded automatic retry.
 *
 * Retries are issued only for transport-level failures - a network failure
 * or a timeout abort - both of which `apiClient` surfaces as an `ApiError`
 * with `status === 0`. A response that carried an HTTP status code (any
 * other `ApiError`) is rethrown immediately without retrying.
 *
 * The attempt counter lives entirely inside this function call, so it never
 * persists across separate invocations of `getScenario` (e.g. a
 * player-activated retry is a fresh call with its own fresh allowance).
 */
async function fetchWithTimeoutAndRetry<T>(
  request: (signal: AbortSignal) => Promise<T>,
  { timeoutMs, maxAttempts }: FetchWithTimeoutAndRetryOptions,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await request(controller.signal);
    } catch (error) {
      const isTransportFailure = error instanceof ApiError && error.status === 0;
      const isLastAttempt = attempt === maxAttempts;

      if (!isTransportFailure || isLastAttempt) {
        throw error;
      }
      // Otherwise: transport failure with attempts remaining, loop and retry.
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Unreachable: the loop above always returns or throws on its final iteration.
  throw new ApiError(0, "Skenario tidak dapat dimuat. Silakan coba lagi.", "Retry loop exhausted");
}

/**
 * Maps a raw `learning_materials` element into a typed `LearningMaterialItem`,
 * field-by-field, so an absent or `null` optional field becomes `undefined`
 * on the result without dropping any of the item's other fields
 * (Requirement 2.4). `??` maps both `null` and `undefined` input to
 * `undefined` output while passing any other value through unchanged.
 */
function normalizeLearningMaterialItem(raw: RawLearningMaterialItem): LearningMaterialItem {
  return {
    id: typeof raw.id === "string" ? raw.id : String(raw.id ?? ""),
    title: typeof raw.title === "string" ? raw.title : String(raw.title ?? ""),
    description: (raw.description as string | null | undefined) ?? undefined,
    formal_file_url: (raw.formal_file_url as string | null | undefined) ?? undefined,
    brainrot_file_url: (raw.brainrot_file_url as string | null | undefined) ?? undefined,
    source_name: (raw.source_name as string | null | undefined) ?? undefined,
    source_url: (raw.source_url as string | null | undefined) ?? undefined,
    created_at: (raw.created_at as string | undefined) ?? undefined,
  };
}

/**
 * Validates and normalizes a raw `GET /api/v1/scenarios/{id}` response body
 * into a typed `ScenarioDetail`.
 *
 * - Throws an uncached, malformed-data `ApiError` when `id` or `title` is
 *   absent (Requirement 2.10). Throwing here means the caller never receives
 *   a value to cache, so TanStack Query naturally treats the response as a
 *   failed fetch rather than caching it.
 * - Defaults `learning_materials` to `[]` when absent or not an array
 *   (Requirement 2.5), otherwise maps every item in place, preserving order
 *   (Requirement 2.3) and per-item field fidelity (Requirement 2.4).
 */
export function normalizeScenarioDetail(raw: RawScenarioDetailResponse): ScenarioDetail {
  const hasId = typeof raw.id === "string" && raw.id.length > 0;
  const hasTitle = typeof raw.title === "string" && raw.title.length > 0;

  if (!hasId || !hasTitle) {
    throw new ApiError(
      0,
      "Data skenario tidak valid.",
      "Malformed scenario detail: missing id or title",
    );
  }

  const learningMaterials = Array.isArray(raw.learning_materials)
    ? (raw.learning_materials as RawLearningMaterialItem[]).map(normalizeLearningMaterialItem)
    : [];

  return {
    id: raw.id as string,
    title: raw.title as string,
    slug: (raw.slug as string) ?? "",
    description: (raw.description as string) ?? "",
    category: (raw.category as ScenarioListItem["category"]) ?? "",
    difficulty: (raw.difficulty as ScenarioListItem["difficulty"]) ?? "",
    npc_role: (raw.npc_role as string) ?? "",
    max_turns: (raw.max_turns as number) ?? 0,
    financial_context: (raw.financial_context as ScenarioFinancialContext) ?? {},
    objective: (raw.objective as string) ?? "",
    initial_state: raw.initial_state as SessionStateData,
    created_at: (raw.created_at as string) ?? "",
    learning_materials: learningMaterials,
  };
}

export async function getScenario(id: string): Promise<ScenarioDetail> {
  const trimmed = id.trim();
  if (!trimmed) {
    throw new ApiError(0, "Identifier skenario tidak valid.", "Empty scenario id");
  }

  const raw = await fetchWithTimeoutAndRetry(
    (signal) =>
      apiClient<RawScenarioDetailResponse>(`/api/v1/scenarios/${encodeURIComponent(trimmed)}`, {
        method: "GET",
        token: null, // never attach a stored token to this request, per Requirement 2.2
        signal,
      }),
    { timeoutMs: 10_000, maxAttempts: 3 }, // 1 initial attempt + 2 automatic retries
  );

  return normalizeScenarioDetail(raw);
}
