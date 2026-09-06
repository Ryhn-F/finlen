"use client";

import { useCallback, useSyncExternalStore } from "react";

const SIDEBAR_STORAGE_KEY = "finlen_sidebar_minimized";
const SIDEBAR_EVENT = "finlen-sidebar-toggle";

// In-memory cache ensures zero-latency access across client-side page transitions
let cachedState: boolean | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/**
 * Reads the current minimized state synchronously from memory or localStorage.
 */
export function getSidebarMinimized(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedState === null) {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      cachedState = stored === "true";
    } catch {
      cachedState = false;
    }
  }
  return cachedState;
}

/**
 * Sets the minimized state globally, persisting to localStorage and notifying all listeners.
 */
export function setSidebarMinimized(
  value: boolean | ((prev: boolean) => boolean)
) {
  const current = getSidebarMinimized();
  const next = typeof value === "function" ? value(current) : value;
  cachedState = next;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      window.dispatchEvent(new CustomEvent(SIDEBAR_EVENT, { detail: next }));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  notify();
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === SIDEBAR_STORAGE_KEY) {
      cachedState = e.newValue === "true";
      callback();
    }
  };

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<boolean>;
    if (typeof custom.detail === "boolean") {
      cachedState = custom.detail;
    }
    callback();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
    window.addEventListener(SIDEBAR_EVENT, handleCustomEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SIDEBAR_EVENT, handleCustomEvent);
    }
  };
}

/**
 * Hook providing reactive, persistent access to the sidebar minimized state.
 * Returns `[isMinimized, setMinimized]`.
 */
export function useSidebarState(
  defaultState = false
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void] {
  const isMinimized = useSyncExternalStore(
    subscribe,
    getSidebarMinimized,
    () => defaultState
  );

  const setMinimized = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setSidebarMinimized(value);
    },
    []
  );

  return [isMinimized, setMinimized];
}
