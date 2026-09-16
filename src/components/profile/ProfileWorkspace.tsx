"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import {
  ArrowClockwise,
  ArrowRight,
  BookOpenText,
  CalendarBlank,
  ChartLineUp,
  IdentificationCard,
  LockKey,
  Scan,
  ShieldCheck,
  Sparkle,
  Target,
  UserCircle,
  WarningCircle,
  type IconProps,
} from "@phosphor-icons/react";
import AppSidebar, {
  useSidebarState,
} from "@/components/navigation/AppSidebar";
import AppTopbar from "@/components/navigation/AppTopbar";
import { AuthModal } from "@/components/roleplay/AuthModal";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import { ProfileSkeleton } from "./ProfileSkeleton";

type LearningPath = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<IconProps>;
};

const LEARNING_PATHS: LearningPath[] = [
  {
    title: "Uji keputusan",
    description: "Bandingkan konsekuensi finansial sebelum memilih.",
    href: "/app/simulator",
    icon: ChartLineUp,
  },
  {
    title: "Latih percakapan",
    description: "Hadapi skenario sulit dalam ruang yang aman.",
    href: "/app/roleplay",
    icon: BookOpenText,
  },
  {
    title: "Periksa dokumen",
    description: "Temukan istilah dan risiko yang perlu diverifikasi.",
    href: "/app/scanner",
    icon: Scan,
  },
];

const numberFormatter = new Intl.NumberFormat("id-ID");
const scoreFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(Math.max(value, minimum), maximum);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Belum tersedia" : dateFormatter.format(date);
}

type InstinctTone = "low" | "normal" | "growing" | "good" | "strong";

type InstinctCriterion = {
  label: string;
  range: string;
  maximum: number;
  tone: InstinctTone;
  message: string;
};

const INSTINCT_CRITERIA: InstinctCriterion[] = [
  {
    label: "Low",
    range: "0–30",
    maximum: 30,
    tone: "low",
    message:
      "Mulai dari langkah kecil: berhenti sejenak dan periksa informasi sebelum mengambil keputusan finansial.",
  },
  {
    label: "Normal",
    range: "31–50",
    maximum: 50,
    tone: "normal",
    message:
      "Fondasi awalmu sudah terbentuk. Latihan rutin akan membantu respons hati-hati terasa lebih alami.",
  },
  {
    label: "Growing",
    range: "51–70",
    maximum: 70,
    tone: "growing",
    message:
      "Naluri finansialmu sedang berkembang. Kamu makin terbiasa mengenali risiko dan membandingkan pilihan.",
  },
  {
    label: "Good enough",
    range: "71–90",
    maximum: 90,
    tone: "good",
    message:
      "Kamu cukup konsisten memeriksa informasi dan menimbang risiko sebelum memilih.",
  },
  {
    label: "Strong",
    range: "91–100",
    maximum: 100,
    tone: "strong",
    message:
      "Naluri finansialmu kuat. Pertahankan kebiasaan kritis dan terus uji keputusan dalam beragam situasi.",
  },
];

function getInstinctCriterion(score: number): InstinctCriterion {
  return (
    INSTINCT_CRITERIA.find((criterion) => score <= criterion.maximum) ??
    INSTINCT_CRITERIA[INSTINCT_CRITERIA.length - 1]
  );
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) return error.userMessage;
  return "Profilmu belum dapat dimuat. Periksa koneksi lalu coba kembali.";
}

export function ProfileWorkspace() {
  const {
    user,
    token,
    isLoading,
    isRefreshing,
    isAuthenticated,
    authError,
    refreshUser,
    openAuthModal,
  } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();

  const handleSidebarToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen((previous) => !previous);
    } else {
      setSidebarMinimized((previous) => !previous);
    }
  };

  return (
    <div className={`app-shell ${sidebarMinimized ? "is-minimized" : ""}`}>
      <AppSidebar
        isMinimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItemId="profile"
        user={{
          name: user?.username || "Tamu FinLen",
          role: user ? `Level ${user.level} · ${user.xp} XP` : "Profil tersimpan",
          profileHref: "/app/profile",
        }}
      />

      <div className="app-main">
        <AppTopbar
          title="Profil & Progres"
          subtitle="Ruang Perkembanganmu"
          onToggleSidebar={handleSidebarToggle}
          actions={
            isLoading ? null : isAuthenticated ? (
              <button
                type="button"
                className={`button button-secondary profile-refresh-button ${isRefreshing ? "is-refreshing" : ""}`}
                onClick={() => void refreshUser()}
                disabled={isRefreshing}
                aria-label={isRefreshing ? "Sedang memperbarui profil" : "Perbarui profil"}
              >
                <ArrowClockwise size={17} weight="bold" aria-hidden="true" />
                <span>{isRefreshing ? "Memperbarui…" : "Perbarui"}</span>
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary profile-topbar-login"
                onClick={() => openAuthModal("login")}
                aria-label="Masuk ke akun"
              >
                <span>Masuk</span>
                <span className="button-orb" aria-hidden="true">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </button>
            )
          }
        />

        {isLoading ? (
          <ProfileSkeleton />
        ) : authError && token ? (
          <ProfileErrorState
            message={getErrorMessage(authError)}
            onRetry={() => void refreshUser()}
            isRetrying={isRefreshing}
          />
        ) : !isAuthenticated || !user ? (
          <ProfileSignedOutState
            onLogin={() => openAuthModal("login")}
            onRegister={() => openAuthModal("register")}
          />
        ) : (
          <ProfileContent user={user} />
        )}
      </div>

      <AuthModal />
    </div>
  );
}

function ProfileContent({
  user,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const score = clamp(Number(user.financial_instinct), 0, 100);
  const instinctCriterion = getInstinctCriterion(score);
  const xp = Math.max(0, Math.floor(Number(user.xp) || 0));
  const level = Math.max(1, Math.floor(Number(user.level) || 1));
  const xpWithinLevel = xp % 100;
  const xpUntilNextLevel = 100 - xpWithinLevel;
  const updatedAt = formatDate(user.updated_at);
  const initial = user.username.trim().charAt(0).toUpperCase() || "F";

  return (
    <main className="profile-main">
      <header className="profile-intro">
        <span className="eyebrow">PROFIL PEMAIN</span>
        <div className="profile-intro-heading">
          <div>
            <h1>Halo, {user.username}.</h1>
            <p>
              Ini bukan nilai kredit. Ini adalah jejak latihan tentang cara kamu
              memeriksa informasi, mengenali risiko, dan mengambil keputusan.
            </p>
          </div>
          <div className="profile-avatar" aria-hidden="true">
            <span>{initial}</span>
          </div>
        </div>
      </header>

      <section className="profile-overview-grid" aria-label="Ringkasan progres">
        <div className="profile-card-shell profile-instinct-shell">
          <article className="profile-card-core profile-instinct-card">
            <div className="profile-instinct-copy">
              <span className="profile-card-kicker">
                <ShieldCheck size={19} weight="duotone" aria-hidden="true" />
                Naluri Finansial
              </span>
              <h2>Keputusan yang lebih tenang dimulai dari latihan.</h2>
              <p>{instinctCriterion.message}</p>

              <div className="profile-criteria" aria-label="Kriteria skor Naluri Finansial">
                <span className="profile-criteria-title">Kriteria skor</span>
                <ul>
                  {INSTINCT_CRITERIA.map((criterion) => (
                    <li
                      key={criterion.tone}
                      className={`is-${criterion.tone} ${criterion.tone === instinctCriterion.tone ? "is-active" : ""}`}
                    >
                      <span className="profile-criteria-dot" aria-hidden="true" />
                      <span>
                        <strong>{criterion.label}</strong>
                        <small>{criterion.range}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <span className="profile-updated">Diperbarui {updatedAt}</span>
            </div>

            <div className={`profile-score-panel is-${instinctCriterion.tone}`}>
              <div
                className="profile-score-gauge"
                role="img"
                aria-label={`Naluri Finansial ${scoreFormatter.format(score)} persen, kriteria ${instinctCriterion.label}`}
              >
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="profile-gauge-track" cx="60" cy="60" r="52" pathLength="100" />
                  <circle
                    className="profile-gauge-value"
                    cx="60"
                    cy="60"
                    r="52"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={100 - score}
                  />
                </svg>
                <span className="profile-score-value">
                  <strong>{scoreFormatter.format(score)}</strong>
                  <small>%</small>
                </span>
              </div>
              <div className="profile-current-criterion">
                <span className="profile-current-dot" aria-hidden="true" />
                <span>
                  <small>Kriteria saat ini</small>
                  <strong>{instinctCriterion.label}</strong>
                </span>
              </div>
            </div>
          </article>
        </div>

        <div className="profile-side-stack">
          <div className="profile-card-shell">
            <article className="profile-card-core profile-level-card">
              <span className="profile-metric-icon" aria-hidden="true">
                <Target size={25} weight="duotone" />
              </span>
              <div>
                <span className="profile-card-kicker">Level saat ini</span>
                <strong className="profile-level-value">{level}</strong>
              </div>
            </article>
          </div>

          <div className="profile-card-shell">
            <article className="profile-card-core profile-xp-card">
              <div className="profile-xp-heading">
                <div>
                  <span className="profile-card-kicker">Total pengalaman</span>
                  <strong>{numberFormatter.format(xp)} XP</strong>
                </div>
                <span>{numberFormatter.format(xpUntilNextLevel)} XP lagi</span>
              </div>
              <div
                className="profile-xp-track"
                role="progressbar"
                aria-label="Progres menuju level berikutnya"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={xpWithinLevel}
              >
                <span style={{ width: `${xpWithinLevel}%` }} />
              </div>
              <div className="profile-xp-scale">
                <span>{numberFormatter.format(xpWithinLevel)} / 100 XP</span>
                <span>Level {level + 1}</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="profile-detail-grid">
        <div className="profile-card-shell">
          <article className="profile-card-core profile-account-card">
            <div className="profile-section-heading">
              <span className="profile-section-icon" aria-hidden="true">
                <IdentificationCard size={24} weight="duotone" />
              </span>
              <div>
                <h2>Detail akun</h2>
                <p>Identitas yang terhubung dengan progresmu.</p>
              </div>
            </div>

            <dl className="profile-account-list">
              <div>
                <dt>
                  <UserCircle size={18} weight="duotone" aria-hidden="true" />
                  Nama pengguna
                </dt>
                <dd>{user.username}</dd>
              </div>
              <div>
                <dt>
                  <IdentificationCard size={18} weight="duotone" aria-hidden="true" />
                  Email
                </dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>
                  <CalendarBlank size={18} weight="duotone" aria-hidden="true" />
                  Bergabung sejak
                </dt>
                <dd>{formatDate(user.created_at)}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="profile-card-shell profile-paths-shell">
          <article className="profile-card-core profile-paths-card">
            <div className="profile-section-heading">
              <span className="profile-section-icon is-coral" aria-hidden="true">
                <Sparkle size={24} weight="duotone" />
              </span>
              <div>
                <h2>Terus asah nalurimu</h2>
                <p>Pilih latihan berikutnya sesuai hal yang ingin kamu kuasai.</p>
              </div>
            </div>

            <nav className="profile-path-list" aria-label="Pilihan latihan FinLen">
              {LEARNING_PATHS.map((path) => {
                const Icon = path.icon;
                return (
                  <Link key={path.href} href={path.href} className="profile-path-link">
                    <span className="profile-path-icon" aria-hidden="true">
                      <Icon size={22} weight="duotone" />
                    </span>
                    <span className="profile-path-copy">
                      <strong>{path.title}</strong>
                      <small>{path.description}</small>
                    </span>
                    <span className="profile-path-arrow" aria-hidden="true">
                      <ArrowRight size={17} weight="bold" />
                    </span>
                  </Link>
                );
              })}
            </nav>
          </article>
        </div>
      </section>

      <p className="profile-education-note">
        <ShieldCheck size={17} weight="duotone" aria-hidden="true" />
        Skor ini adalah alat refleksi edukatif dari aktivitas FinLen, bukan
        penilaian kelayakan kredit atau nasihat keuangan.
      </p>
    </main>
  );
}

function ProfileErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <main className="profile-main profile-state-main">
      <section className="profile-state-shell">
        <div className="profile-state-card" role="alert">
          <span className="profile-state-icon is-warning" aria-hidden="true">
            <WarningCircle size={34} weight="duotone" />
          </span>
          <span className="profile-card-kicker">KONEKSI TERJEDA</span>
          <h1>Progresmu aman, tetapi belum dapat kami tampilkan.</h1>
          <p>{message}</p>
          <button
            type="button"
            className="button button-primary"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <span>{isRetrying ? "Mencoba…" : "Coba Lagi"}</span>
            <span className="button-orb" aria-hidden="true">
              <ArrowClockwise size={16} weight="bold" />
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}

function ProfileSignedOutState({
  onLogin,
  onRegister,
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <main className="profile-main profile-state-main">
      <section className="profile-state-shell">
        <div className="profile-state-card">
          <span className="profile-state-icon" aria-hidden="true">
            <LockKey size={34} weight="duotone" />
          </span>
          <span className="profile-card-kicker">RUANG PRIBADIMU</span>
          <h1>Masuk untuk melihat profil dan progresmu.</h1>
          <p>
            Level, XP, dan Naluri Finansial tersimpan aman di akunmu agar kamu
            bisa melanjutkan latihan kapan saja.
          </p>
          <div className="profile-state-actions">
            <button type="button" className="button button-primary" onClick={onLogin}>
              <span>Masuk</span>
              <span className="button-orb" aria-hidden="true">
                <ArrowRight size={16} weight="bold" />
              </span>
            </button>
            <button type="button" className="button button-secondary" onClick={onRegister}>
              Daftar Gratis
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
