"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import {
  useCompleteRoleplaySession,
  useRoleplayMessages,
  useRoleplaySession,
  useSendRoleplayMessage,
} from "@/lib/hooks/useRoleplay";
import { resolveEffectiveMaxTurns } from "@/lib/utils/scenarioDetail";
import { RoleplayChat } from "./RoleplayChat";
import { RoleplayError } from "./RoleplayError";
import { RoleplayChatSkeleton } from "./RoleplaySkeleton";
import { RoleplayStats } from "./RoleplayStats";
import { SessionComplete } from "./SessionComplete";
import { SessionHeader } from "./SessionHeader";

interface SessionPageContentProps {
  sessionId: string;
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.userMessage : fallback;
}

/**
 * Owns the live roleplay session lifecycle (session detail, transcript,
 * decision input, stats panel, and completion scorecard) for a single
 * `session_id`, extracted from the pre-refactor `RoleplayWorkspace.tsx`.
 *
 * Requirements: 8.1, 8.2, 8.4, 8.5, 8.6, 8.8, 8.9, 8.10, 8.12, 8.13
 */
export function SessionPageContent({ sessionId }: SessionPageContentProps) {
  const router = useRouter();

  const sessionQuery = useRoleplaySession(sessionId);
  const messagesQuery = useRoleplayMessages(sessionId);
  const sendMessageMutation = useSendRoleplayMessage(sessionId);
  const completeSessionMutation = useCompleteRoleplaySession(sessionId);

  const session = sessionQuery.data;
  const messages = messagesQuery.data || [];
  const isCompleted = session?.status === "completed";

  // Requirement 8.6: derived solely from the session detail, no scenario lookup.
  const maxTurns = resolveEffectiveMaxTurns(session?.max_turns);

  const userMessages = messages.filter((m) => m.sender === "user");
  const userDecisionsCount = userMessages.length;
  const hasPendingUserMessage = userMessages.some((m) => m.isPending);
  const evaluatedUserTurns = userMessages.filter((m) => !m.isPending && !m.isFailed).length;

  const effectiveTurnNumber = Math.min(
    maxTurns,
    Math.max(session?.turn_number || 1, userDecisionsCount + (hasPendingUserMessage ? 0 : 1)),
  );

  const [reviewingTranscript, setReviewingTranscript] = useState(false);
  const [autoCompletingSessionId, setAutoCompletingSessionId] = useState<string | null>(null);
  const autoCompletedSessionRef = useRef<string | null>(null);
  const isAutoCompleting = autoCompletingSessionId === sessionId;

  // Requirement 8.6/8.13: fires at most once per session, never once completed.
  useEffect(() => {
    if (
      session &&
      session.status === "active" &&
      !isCompleted &&
      !sendMessageMutation.isPending &&
      !completeSessionMutation.isPending &&
      evaluatedUserTurns >= maxTurns &&
      autoCompletedSessionRef.current !== sessionId
    ) {
      autoCompletedSessionRef.current = sessionId;
      setAutoCompletingSessionId(sessionId);

      const timer = setTimeout(async () => {
        try {
          await completeSessionMutation.mutateAsync();
          setReviewingTranscript(false);
        } catch {
          // Requirement 8.7: no automatic retry. A manual retry control is
          // rendered from completeSessionMutation's error state below.
        } finally {
          setAutoCompletingSessionId(null);
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [
    sessionId,
    session,
    isCompleted,
    sendMessageMutation.isPending,
    completeSessionMutation,
    evaluatedUserTurns,
    maxTurns,
  ]);

  function handleSendMessage(messageText: string) {
    if (!sessionId) return;
    // Requirement 8.12: reject submission once the effective max turn count
    // has been reached, even if RoleplayChat's own UI guard is bypassed.
    if (session?.status === "active" && evaluatedUserTurns >= maxTurns) return;
    sendMessageMutation.mutate(messageText);
  }

  async function handleCompleteSession() {
    try {
      await completeSessionMutation.mutateAsync();
      setReviewingTranscript(false);
    } catch {
      // Handled via completeSessionMutation's error state.
    }
  }

  function handleChooseAnother() {
    router.push("/app/roleplay");
  }

  // Requirement 8.2: session-detail request in flight with no cached detail.
  if (sessionQuery.isLoading && !session) {
    return (
      <div className="roleplay-session-content" role="status" aria-label="Memuat sesi roleplay">
        <div className="session-loading-header shimmer" aria-hidden="true" />
        <RoleplayChatSkeleton />
      </div>
    );
  }

  // Requirement 8.3: session-detail request failed.
  if (sessionQuery.isError || !session) {
    return (
      <div className="roleplay-session-content">
        <RoleplayError
          message={resolveErrorMessage(
            sessionQuery.error,
            "Sesi roleplay tidak dapat dimuat. Silakan coba lagi.",
          )}
          onRetry={handleChooseAnother}
          retryLabel="Kembali ke Daftar Skenario"
        />
      </div>
    );
  }

  const isMaxTurn = session.status === "active" && evaluatedUserTurns >= maxTurns;

  return (
    <div className="roleplay-session-content">
      <SessionHeader
        scenarioTitle={session.scenario_title}
        turnNumber={effectiveTurnNumber}
        maxTurns={maxTurns}
        status={session.status}
        onExit={handleChooseAnother}
        onComplete={!isCompleted ? handleCompleteSession : undefined}
        isCompleting={completeSessionMutation.isPending || isAutoCompleting}
      />

      {/* Requirement 8.7: completion failures keep the session active, retain
          the transcript, and require a manual (non-automatic) retry. */}
      {completeSessionMutation.isError && (
        <RoleplayError
          title="Sesi Tidak Dapat Diselesaikan"
          message={resolveErrorMessage(
            completeSessionMutation.error,
            "Sesi roleplay tidak dapat diselesaikan. Silakan coba lagi.",
          )}
          onRetry={handleCompleteSession}
          retryLabel="Coba Selesaikan Lagi"
        />
      )}

      {isCompleted && !reviewingTranscript ? (
        // Requirement 8.5/8.8/8.11: completion scorecard, no new session-detail request.
        <SessionComplete
          scenarioTitle={session.scenario_title}
          scores={session.scores}
          xpEarned={session.xp_earned}
          onReviewTranscript={() => setReviewingTranscript(true)}
          onChooseAnother={handleChooseAnother}
        />
      ) : messagesQuery.isError && !messagesQuery.data ? (
        // Requirement 8.9: message-list failure scoped to the transcript area.
        <div className="roleplay-decision-room-grid">
          <RoleplayError
            message={resolveErrorMessage(
              messagesQuery.error,
              "Riwayat percakapan tidak dapat dimuat.",
            )}
            onRetry={() => messagesQuery.refetch()}
            retryLabel="Muat Ulang Percakapan"
          />
          <RoleplayStats
            state={session.current_state}
            scores={session.scores}
            xpEarned={session.xp_earned}
          />
        </div>
      ) : messagesQuery.isLoading && !messagesQuery.data ? (
        <RoleplayChatSkeleton />
      ) : (
        // Requirement 8.4/8.5: active transcript + decision input + stats,
        // or the transcript view toggled from a completed session.
        <div className="roleplay-decision-room-grid">
          <RoleplayChat
            messages={messages}
            isNpcResponding={sendMessageMutation.isPending}
            isCompleted={isCompleted}
            isCompleting={completeSessionMutation.isPending || isAutoCompleting}
            isMaxTurn={isMaxTurn}
            maxTurns={maxTurns}
            answerChoices={session.answers_choices}
            onSendMessage={handleSendMessage}
          />
          <RoleplayStats
            state={session.current_state}
            scores={session.scores}
            xpEarned={session.xp_earned}
          />
        </div>
      )}
    </div>
  );
}
