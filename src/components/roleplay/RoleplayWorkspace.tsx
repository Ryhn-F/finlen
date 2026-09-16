"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar, AppTopbar, useSidebarState } from "@/components/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { ScenarioSelector } from "./ScenarioSelector";
import { AuthModal } from "./AuthModal";
import { LockKey, SignIn, UserPlus } from "@phosphor-icons/react";

// Brief guard window to prevent a double-click from issuing two navigations
// while the router transition is in flight.
const START_GUARD_MS = 600;

export default function RoleplayWorkspace() {
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();
  const [startingScenarioId, setStartingScenarioId] = useState<string | null>(null);

  // Start a scenario: navigate to the scenario briefing page.
  function handleStartScenario(scenarioId: string) {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (startingScenarioId) return;

    setStartingScenarioId(scenarioId);
    router.push(`/app/roleplay/scenario/${scenarioId}`);
    setTimeout(() => setStartingScenarioId(null), START_GUARD_MS);
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
          profileHref: "/app/profile",
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
          {!isAuthenticated && (
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

          <ScenarioSelector
            onSelectScenario={handleStartScenario}
            startingScenarioId={startingScenarioId}
          />
        </main>
      </div>

      <AuthModal />
    </div>
  );
}
