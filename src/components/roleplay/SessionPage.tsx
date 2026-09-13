"use client";

import { useState } from "react";
import { LockKey } from "@phosphor-icons/react";
import { AppSidebar, AppTopbar, useSidebarState } from "@/components/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AuthModal } from "./AuthModal";
import { RoleplayChatSkeleton } from "./RoleplaySkeleton";
import { SessionPageContent } from "./SessionPageContent";

interface SessionPageProps {
  sessionId: string;
}

/**
 * Client container for route `/app/roleplay/{session_id}`.
 *
 * Renders the FinLen app shell and gates the session-lifecycle content
 * behind authentication. `SessionPageContent` is only ever mounted once
 * `isLoading` has settled to `false` and `isAuthenticated` is `true` —
 * the session-detail/message requests it issues require a Bearer token
 * (`requiresAuth: true` in `roleplay.ts`), so mounting it while auth state
 * is still resolving would issue a request doomed to fail with a synchronous
 * 401 `ApiError`, flashing `SessionPageContent`'s generic "session tidak
 * dapat dimuat" error branch before flipping to the correct state. While
 * `isLoading`, a neutral loading skeleton is rendered instead; once auth
 * state resolves to unauthenticated, the Indonesian sign-in-required
 * message is rendered with a control opening `AuthModal` in login mode.
 *
 * Requirements: 1.8, 7.7
 */
export function SessionPage({ sessionId }: SessionPageProps) {
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();

  let content: React.ReactNode;

  if (isLoading) {
    // Auth state still resolving: avoid mounting SessionPageContent, whose
    // session-detail request would fail with a premature 401 before this
    // resolves to either the guard message or the real session content.
    content = (
      <div className="roleplay-session-content" role="status" aria-label="Memuat sesi roleplay">
        <div className="session-loading-header shimmer" aria-hidden="true" />
        <RoleplayChatSkeleton />
      </div>
    );
  } else if (!isAuthenticated) {
    // Requirement 7.7: stay on this route, render an Indonesian sign-in
    // notice with a control opening the Auth_Modal in login mode.
    content = (
      <div className="session-signin-required" role="status">
        <div className="guest-banner-text">
          <LockKey size={20} weight="duotone" className="guest-lock-icon" />
          <p>
            <strong>Kamu perlu masuk.</strong> Masuk ke akun FinLen untuk mengakses
            sesi roleplay ini.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => openAuthModal("login")}
        >
          Masuk ke Akun
        </button>
      </div>
    );
  } else {
    content = <SessionPageContent sessionId={sessionId} />;
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
          title="Sesi Roleplay"
          subtitle="Simulasi Tekanan & Pengambilan Keputusan Nyata"
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarOpen((prev) => !prev);
            } else {
              setSidebarMinimized((prev) => !prev);
            }
          }}
        />

        <main className="roleplay-main-container session-page-main">{content}</main>
      </div>

      <AuthModal />
    </div>
  );
}
