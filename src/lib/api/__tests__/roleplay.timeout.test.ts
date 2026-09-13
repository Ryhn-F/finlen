import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoleplaySession } from "../roleplay";
import { ApiError, setAuthToken } from "../client";

describe("createRoleplaySession - 30 second timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // requiresAuth: true requires a stored token before apiClient will issue the request.
    setAuthToken("test-token");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setAuthToken(null);
  });

  it("aborts the request and rejects with the Indonesian retry message after 30s", async () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        // Mirrors real fetch behavior: rejecting with an AbortError once the
        // AbortController's signal fires, and otherwise never settling.
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const pending = createRoleplaySession("some-scenario-id");

    // Fail fast if the promise settles before the timeout should fire.
    let settledEarly = false;
    pending.catch(() => {
      settledEarly = true;
    });
    await vi.advanceTimersByTimeAsync(29_999);
    expect(settledEarly).toBe(false);

    await vi.advanceTimersByTimeAsync(1);

    await expect(pending).rejects.toMatchObject({
      status: 0,
      userMessage: "Sesi tidak dapat dimulai. Silakan coba lagi.",
    });
    await expect(pending).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("propagates unrelated fetch failures without the timeout-specific message", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createRoleplaySession("some-scenario-id")).rejects.toMatchObject({
      status: 0,
      userMessage:
        "Tidak dapat terhubung ke server backend FinLen. Pastikan backend di port 8000 sedang berjalan.",
    });
  });
});
