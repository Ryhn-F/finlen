"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "@/lib/context/AuthContext";
import { useCreateRoleplaySession } from "@/lib/hooks/useRoleplay";
import { ApiError } from "@/lib/api/client";
import type { ScenarioDetail } from "@/lib/types/roleplay";

interface StartSessionButtonProps {
  scenario: ScenarioDetail | null | undefined;
}

const FALLBACK_ERROR_MESSAGE = "Sesi tidak dapat dimulai. Silakan coba lagi.";

function isValidSessionId(sessionId: unknown): sessionId is string {
  return typeof sessionId === "string" && sessionId.trim().length > 0;
}

export function StartSessionButton({ scenario }: StartSessionButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const createSessionMutation = useCreateRoleplaySession();
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const isPending = createSessionMutation.isPending;
  const isBusy = isPending || isNavigating;
  // Requirement 6.11: disabled while no scenario is loaded.
  // Requirement 7.4: disabled while auth state is resolving.
  // Requirement 7.10: NOT disabled merely because the visitor is unauthenticated.
  const isDisabled = isAuthLoading || !scenario || isBusy;

  async function handleActivate() {
    // Requirement 7.4: while auth is resolving, issue no request and open no modal.
    if (isAuthLoading) return;

    // Requirement 7.2/7.8: unauthenticated activation opens the Auth_Modal and issues no request.
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    // Requirement 6.11: no scenario loaded, no request.
    if (!scenario) return;

    // Requirement 6.9: discard extra activations while a request is already in flight
    // (also guards against re-activation while navigating post-success).
    if (isBusy) return;

    // Requirement 6.8: clear the previous error on a new activation before reissuing.
    setInlineMessage(null);

    try {
      const result = await createSessionMutation.mutateAsync(scenario.id);
      if (isValidSessionId(result.session_id)) {
        // Requirement 6.6: keep disabled + in-progress label through navigation.
        setIsNavigating(true);
        // Requirement 6.5: cache seeding happens inside useCreateRoleplaySession's
        // onSuccess, which resolves before mutateAsync settles, i.e. before this line.
        router.push(`/app/roleplay/${result.session_id}`);
      } else {
        // Requirement 6.12: 201 without a usable session_id.
        setInlineMessage(FALLBACK_ERROR_MESSAGE);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Requirement 7.6: open Auth_Modal, render no inline userMessage for 401.
        openAuthModal("login");
        return;
      }
      // Requirement 6.7: any other failure (status, transport error, or timeout).
      const message = err instanceof ApiError ? err.userMessage : FALLBACK_ERROR_MESSAGE;
      setInlineMessage(message);
    }
  }

  const label = isBusy ? "Memulai..." : "Mulai Roleplay";

  return (
    <div className="start-session-wrap">
      {!isAuthenticated && !isAuthLoading && (
        <p className="start-session-auth-notice">
          Kamu perlu masuk ke akun FinLen untuk memulai sesi roleplay.
        </p>
      )}
      <button
        type="button"
        className="button button-primary start-session-btn"
        onClick={handleActivate}
        disabled={isDisabled}
        aria-busy={isBusy}
      >
        <span>{label}</span>
        <span className="button-orb" aria-hidden="true">
          <ArrowRight size={16} weight="bold" />
        </span>
      </button>
      {inlineMessage && (
        <p className="start-session-error" role="alert">
          {inlineMessage}
        </p>
      )}
    </div>
  );
}
