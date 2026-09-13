"use client";

import { useState } from "react";
import { AppSidebar, AppTopbar, useSidebarState } from "@/components/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useScenario } from "@/lib/hooks/useScenarios";
import { ApiError } from "@/lib/api/client";
import { AuthModal } from "./AuthModal";
import { ScenarioBackButton } from "./ScenarioBackButton";
import { ScenarioBriefingSkeleton } from "./RoleplaySkeleton";
import { RoleplayError, ScenarioInvalidState, ScenarioNotFoundState } from "./RoleplayError";
import { ScenarioBriefingLeft } from "./ScenarioBriefingLeft";
import { ScenarioBriefingRight } from "./ScenarioBriefingRight";

interface ScenarioDetailPageProps {
  scenarioId: string;
}

const GENERIC_ERROR_MESSAGE = "Skenario tidak dapat dimuat. Silakan coba lagi.";

/**
 * Client container for route `/app/roleplay/scenario/{scenario_id}`.
 *
 * Validates the `scenario_id` path segment client-side, wires `useScenario`
 * to the Scenario_API_Client, and branches between the loading skeleton,
 * not-found/invalid/generic-error states, and the loaded two-column
 * briefing. Every branch renders exactly one Back_Button; the loaded
 * briefing and the not-found/invalid states get theirs from
 * `ScenarioBriefingLeft`/`ScenarioNotFoundState`/`ScenarioInvalidState`
 * respectively, while the skeleton and generic-error branches render a
 * standalone `ScenarioBackButton` alongside them.
 *
 * Requirements: 1.4, 1.10, 2.8, 5.1, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10,
 * 5.11, 7.1, 7.5, 7.7, 7.9, 7.10
 */
export function ScenarioDetailPage({ scenarioId }: ScenarioDetailPageProps) {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();

  // Requirement 1.10 / 2.8: empty, whitespace-only, or >128-character segments
  // are treated as invalid without ever calling the API.
  const trimmedId = scenarioId.trim();
  const isClientInvalid =
    scenarioId.length === 0 || trimmedId.length === 0 || scenarioId.length > 128;

  // Passing `null` when client-invalid relies on useScenario's own `enabled`
  // gate so no request is ever issued for an invalid segment.
  const scenarioQuery = useScenario(isClientInvalid ? null : scenarioId);

  let content: React.ReactNode;

  if (isClientInvalid) {
    // Requirement 1.10 cross-reference: client-guarded invalid ids render the
    // same outcome as a server-reported 422 (Requirement 5.3).
    content = <ScenarioInvalidState />;
  } else if (scenarioQuery.isLoading && !scenarioQuery.data) {
    // Requirement 5.1/5.8: skeleton only when no cached response exists.
    content = (
      <>
        <ScenarioBackButton />
        <ScenarioBriefingSkeleton />
      </>
    );
  } else if (scenarioQuery.isError) {
    const error = scenarioQuery.error;
    if (error instanceof ApiError && error.status === 404) {
      content = <ScenarioNotFoundState />;
    } else if (error instanceof ApiError && error.status === 422) {
      content = <ScenarioInvalidState />;
    } else {
      const message = error instanceof ApiError ? error.userMessage : GENERIC_ERROR_MESSAGE;
      content = (
        <>
          <ScenarioBackButton />
          <RoleplayError
            message={message}
            onRetry={() => scenarioQuery.refetch()}
            retryLabel="Coba Lagi"
          />
        </>
      );
    }
  } else if (scenarioQuery.data) {
    content = (
      <div className="scenario-briefing-columns">
        <ScenarioBriefingLeft scenario={scenarioQuery.data} />
        <ScenarioBriefingRight scenario={scenarioQuery.data} />
      </div>
    );
  } else {
    // Defensive fallback: query settled with neither data nor error info yet.
    content = (
      <>
        <ScenarioBackButton />
        <ScenarioBriefingSkeleton />
      </>
    );
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
          title="Briefing Skenario"
          subtitle="Pahami Konteks Sebelum Memulai"
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarOpen((prev) => !prev);
            } else {
              setSidebarMinimized((prev) => !prev);
            }
          }}
        />

        <main className="roleplay-main-container scenario-detail-main">{content}</main>
      </div>

      <AuthModal />
    </div>
  );
}
