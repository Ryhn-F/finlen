"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar, AppTopbar, useSidebarState } from "@/components/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  useCompleteRoleplaySession,
  useCreateRoleplaySession,
  useRoleplayMessages,
  useRoleplaySession,
  useSendRoleplayMessage,
} from "@/lib/hooks/useRoleplay";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { ScenarioSelector } from "./ScenarioSelector";
import { SessionHeader } from "./SessionHeader";
import { RoleplayChat } from "./RoleplayChat";
import { RoleplayStats } from "./RoleplayStats";
import { SessionComplete } from "./SessionComplete";
import { RoleplayChatSkeleton } from "./RoleplaySkeleton";
import { RoleplayError } from "./RoleplayError";
import { AuthModal } from "./AuthModal";
import { LockKey, SignIn, UserPlus } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api/client";

function RoleplayInnerWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSessionId = searchParams.get("session");

  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();
  const [startingScenarioId, setStartingScenarioId] = useState<string | null>(null);
  const [reviewingTranscript, setReviewingTranscript] = useState(false);
  // Both auto-complete flags are scoped to a session id so switching sessions
  // invalidates them without needing a state-resetting effect.
  const [autoCompletingSessionId, setAutoCompletingSessionId] = useState<
    string | null
  >(null);
  const autoCompletedSessionRef = useRef<string | null>(null);
  const isAutoCompleting =
    !!activeSessionId && autoCompletingSessionId === activeSessionId;

  // TanStack Query Hooks
  const { data: scenarios } = useScenarios();
  const sessionQuery = useRoleplaySession(activeSessionId);
  const messagesQuery = useRoleplayMessages(activeSessionId);
  const createSessionMutation = useCreateRoleplaySession();
  const sendMessageMutation = useSendRoleplayMessage(activeSessionId || "");
  const completeSessionMutation = useCompleteRoleplaySession(activeSessionId || "");

  const session = sessionQuery.data;
  const messages = messagesQuery.data || [];
  const isCompleted = session?.status === "completed";

  // Resolve scenario & max turns dynamically
  const currentScenario = scenarios?.find(
    (s) => s.slug === session?.scenario || s.title === session?.scenario_title,
  );
  const maxTurns = session?.max_turns || currentScenario?.max_turns || 10;

  // Realtime turn calculation:
  // Derived from user decision messages in the transcript
  const userMessages = messages.filter((m) => m.sender === "user");
  const userDecisionsCount = userMessages.length;
  const hasPendingUserMessage = userMessages.some((m) => m.isPending);
  const evaluatedUserTurns = userMessages.filter((m) => !m.isPending && !m.isFailed).length;

  // Turn number displayed to user:
  // Advances in realtime when user sends a message.
  // Clamped between 1 and maxTurns.
  const effectiveTurnNumber = Math.min(
    maxTurns,
    Math.max(session?.turn_number || 1, userDecisionsCount + (hasPendingUserMessage ? 0 : 1)),
  );

  // Automatically complete session when max turns are reached and evaluated
  useEffect(() => {
    if (
      activeSessionId &&
      session &&
      session.status === "active" &&
      !isCompleted &&
      !sendMessageMutation.isPending &&
      !completeSessionMutation.isPending &&
      evaluatedUserTurns >= maxTurns &&
      autoCompletedSessionRef.current !== activeSessionId
    ) {
      autoCompletedSessionRef.current = activeSessionId;
      setAutoCompletingSessionId(activeSessionId);

      const timer = setTimeout(async () => {
        try {
          await completeSessionMutation.mutateAsync();
          setReviewingTranscript(false);
        } catch {
          // Handled by mutation error state
        } finally {
          setAutoCompletingSessionId(null);
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [
    activeSessionId,
    session,
    isCompleted,
    sendMessageMutation.isPending,
    completeSessionMutation,
    evaluatedUserTurns,
    maxTurns,
  ]);

  // Start a scenario
  async function handleStartScenario(scenarioId: string) {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setStartingScenarioId(scenarioId);
    autoCompletedSessionRef.current = null;
    setAutoCompletingSessionId(null);
    try {
      const newSession = await createSessionMutation.mutateAsync(scenarioId);
      setReviewingTranscript(false);
      // Update URL without full page reload
      router.push(`/app/roleplay?session=${newSession.session_id}`, { scroll: false });
    } catch {
      // Error handled by query/mutation state
    } finally {
      setStartingScenarioId(null);
    }
  }

  // Send a decision message
  function handleSendMessage(messageText: string) {
    if (!activeSessionId) return;
    sendMessageMutation.mutate(messageText);
  }

  // Finalize session
  async function handleCompleteSession() {
    if (!activeSessionId) return;
    try {
      await completeSessionMutation.mutateAsync();
      setReviewingTranscript(false);
    } catch {
      // Handled
    }
  }

  // Exit back to scenario list
  function handleExitToScenarios() {
    setReviewingTranscript(false);
    autoCompletedSessionRef.current = null;
    setAutoCompletingSessionId(null);
    router.push("/app/roleplay", { scroll: false });
  }


  return (
    <div className={`app-shell ${sidebarMinimized ? "is-minimized" : ""}`}>
      <AppSidebar
        isMinimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItemId="roleplay"
        user={{
          name: user?.username || "Tamu FinLen",
          role: user ? `Level ${user.level} · ${user.xp} XP` : "Belum Masuk",
          profileHref: "#profile",
        }}
      />

      <div className="app-main">
        <AppTopbar
          title="Bermain Peran Finansial"
          subtitle="Simulasi Tekanan & Pengambilan Keputusan Nyata"
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarOpen((prev) => !prev);
            } else {
              setSidebarMinimized((prev) => !prev);
            }
          }}
          actions={
            !isAuthenticated ? (
              <div className="topbar-auth-actions">
                <button
                  type="button"
                  className="button button-secondary topbar-login-btn"
                  onClick={() => openAuthModal("login")}
                >
                  <SignIn size={16} weight="bold" />
                  <span>Masuk</span>
                </button>
                <button
                  type="button"
                  className="button button-primary topbar-register-btn"
                  onClick={() => openAuthModal("register")}
                >
                  <UserPlus size={16} weight="bold" />
                  <span>Daftar</span>
                </button>
              </div>
            ) : null
          }
        />

        <main className="roleplay-main-container">
          {/* Guest awareness banner if browsing without login */}
          {!isAuthenticated && !activeSessionId && (
            <div className="roleplay-guest-banner">
              <div className="guest-banner-text">
                <LockKey size={20} weight="duotone" className="guest-lock-icon" />
                <p>
                  <strong>Roleplay membutuhkan akun.</strong> Simpan perkembangan
                  Naluri Finansial dan raih XP dengan masuk ke akun FinLen.
                </p>
              </div>
              <div className="guest-banner-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => openAuthModal("login")}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => openAuthModal("register")}
                >
                  Daftar Gratis
                </button>
              </div>
            </div>
          )}

          {/* Creation Error Banner */}
          {createSessionMutation.isError && (
            <div className="roleplay-inline-error mb-6">
              <RoleplayError
                title="Gagal memulai roleplay"
                message={
                  createSessionMutation.error instanceof ApiError
                    ? createSessionMutation.error.userMessage
                    : createSessionMutation.error?.message ||
                      "Terjadi kesalahan saat membuat sesi roleplay."
                }
              />
            </div>
          )}

          {/* Case 1: No active session -> Scenario Selection */}
          {!activeSessionId && (
            <ScenarioSelector
              onSelectScenario={handleStartScenario}
              startingScenarioId={startingScenarioId}
            />
          )}

          {/* Case 2: Active session loading */}
          {activeSessionId && sessionQuery.isLoading && (
            <div className="roleplay-session-loading-wrap">
              <div className="session-loading-header shimmer" />
              <RoleplayChatSkeleton />
            </div>
          )}

          {/* Case 3: Active session load error */}
          {activeSessionId && sessionQuery.isError && (
            <div className="roleplay-session-error-wrap">
              <RoleplayError
                title="Sesi tidak dapat dibuka"
                message={
                  sessionQuery.error instanceof ApiError
                    ? sessionQuery.error.userMessage
                    : "Sesi ini tidak ditemukan atau kamu tidak memiliki akses."
                }
                onRetry={handleExitToScenarios}
                retryLabel="Kembali ke Daftar Skenario"
              />
            </div>
          )}

          {/* Case 4: Session loaded -> Show Workspace */}
          {activeSessionId && session && (
            <div className="roleplay-active-workspace">
              <SessionHeader
                scenarioTitle={session.scenario_title}
                turnNumber={effectiveTurnNumber}
                maxTurns={maxTurns}
                status={session.status}
                onExit={handleExitToScenarios}
                onComplete={handleCompleteSession}
                isCompleting={completeSessionMutation.isPending || isAutoCompleting}
              />

              {/* Toggle between Scorecard and Chat Transcript */}
              {isCompleted && !reviewingTranscript ? (
                <SessionComplete
                  scenarioTitle={session.scenario_title}
                  scores={session.scores}
                  xpEarned={session.xp_earned}
                  progression={completeSessionMutation.data?.progression}
                  onReviewTranscript={() => setReviewingTranscript(true)}
                  onChooseAnother={handleExitToScenarios}
                />
              ) : (

                <div className="roleplay-decision-room-grid">
                  <div className="decision-room-chat-col">
                    {messagesQuery.isLoading ? (
                      <RoleplayChatSkeleton />
                    ) : (
                      <RoleplayChat
                        messages={messages}
                        npcRoleName={session.scenario_title}
                        isNpcResponding={sendMessageMutation.isPending}
                        isCompleted={isCompleted}
                        isCompleting={completeSessionMutation.isPending || isAutoCompleting}
                        isMaxTurn={effectiveTurnNumber >= maxTurns}
                        maxTurns={maxTurns}
                        onSendMessage={handleSendMessage}
                        onRetrySend={handleSendMessage}
                      />
                    )}
                  </div>

                  <div className="decision-room-stats-col">
                    <RoleplayStats
                      state={session.current_state}
                      scores={session.scores}
                      xpEarned={session.xp_earned}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AuthModal />
    </div>
  );
}

export default function RoleplayWorkspace() {
  return (
    <Suspense
      fallback={
        <div className="roleplay-suspense-fallback">
          <div className="fallback-spinner" />
          <p>Menyiapkan ruang roleplay...</p>
        </div>
      }
    >
      <RoleplayInnerWorkspace />
    </Suspense>
  );
}
