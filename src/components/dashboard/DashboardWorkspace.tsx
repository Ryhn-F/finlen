"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowClockwise,
  ArrowRight,
  Brain,
  ChartLineUp,
  CheckCircle,
  ClockCounterClockwise,
  Gauge,
  Lightning,
  LockKey,
  Minus,
  ShieldCheck,
  Target,
  TrendDown,
  TrendUp,
  Trophy,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppSidebar, { useSidebarState } from "@/components/navigation/AppSidebar";
import AppTopbar from "@/components/navigation/AppTopbar";
import { AuthModal } from "@/components/roleplay/AuthModal";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";
import {
  ROLEPLAY_QUERY_KEYS,
  useRoleplayHistory,
  useRoleplayProgression,
} from "@/lib/hooks/useRoleplay";
import type { RoleplayHistoryItem, UserResponse } from "@/lib/types/roleplay";

const DASHBOARD_HISTORY_LIMIT = 100;
const numberFormatter = new Intl.NumberFormat("id-ID");
const scoreFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});
const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
});
const longDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function timestamp(value: string | null): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value: string | null, fallback = "Belum tersedia"): string {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : longDateFormatter.format(date);
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : shortDateFormatter.format(date);
}

function getStatusLabel(status: string): string {
  if (status === "completed") return "Selesai";
  if (status === "active") return "Berlangsung";
  return status.replaceAll("_", " ");
}

function getErrorMessage(error: Error, fallback: string): string {
  return error instanceof ApiError ? error.userMessage : fallback;
}

export function DashboardWorkspace() {
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
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();
  const [isRefreshingPage, setIsRefreshingPage] = useState(false);

  const handleSidebarToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen((open) => !open);
      return;
    }
    setSidebarMinimized((minimized) => !minimized);
  };

  const handleRefresh = async () => {
    setIsRefreshingPage(true);
    try {
      await Promise.all([
        refreshUser(),
        queryClient.invalidateQueries({
          queryKey: ROLEPLAY_QUERY_KEYS.historyRoot,
        }),
      ]);
    } finally {
      setIsRefreshingPage(false);
    }
  };

  const refreshPending = isRefreshing || isRefreshingPage;

  return (
    <div className={`app-shell ${sidebarMinimized ? "is-minimized" : ""}`}>
      <AppSidebar
        isMinimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItemId="dashboard"
        user={{
          name: user?.username || "Tamu FinLen",
          role: user ? `Level ${user.level} · ${user.xp} XP` : "Dasbor pribadi",
          profileHref: "/app/profile",
        }}
      />

      <div className="app-main">
        <AppTopbar
          title="Dasbor"
          subtitle="Pusat Perkembanganmu"
          onToggleSidebar={handleSidebarToggle}
          actions={
            isLoading ? null : isAuthenticated ? (
              <button
                type="button"
                className={`button button-secondary dashboard-refresh-button ${refreshPending ? "is-refreshing" : ""}`}
                onClick={() => void handleRefresh()}
                disabled={refreshPending}
                aria-label={refreshPending ? "Sedang memperbarui dasbor" : "Perbarui dasbor"}
              >
                <ArrowClockwise size={17} weight="bold" aria-hidden="true" />
                <span>{refreshPending ? "Memperbarui…" : "Perbarui"}</span>
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary dashboard-topbar-login"
                onClick={() => openAuthModal("login")}
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
          <DashboardSkeleton />
        ) : authError && token && !user ? (
          <DashboardProfileError
            message={getErrorMessage(authError, "Data akun belum dapat dimuat.")}
            onRetry={() => void refreshUser()}
            isRetrying={isRefreshing}
          />
        ) : !isAuthenticated || !user ? (
          <DashboardSignedOutState
            onLogin={() => openAuthModal("login")}
            onRegister={() => openAuthModal("register")}
          />
        ) : (
          <DashboardContent user={user} />
        )}
      </div>

      <AuthModal />
    </div>
  );
}

function DashboardContent({ user }: { user: UserResponse }) {
  const historyQuery = useRoleplayHistory({
    limit: DASHBOARD_HISTORY_LIMIT,
    offset: 0,
  });
  const progressionQuery = useRoleplayProgression(DASHBOARD_HISTORY_LIMIT);

  const sortedPoints = useMemo(
    () => [...(progressionQuery.data?.points ?? [])].sort((a, b) => timestamp(a.completed_at) - timestamp(b.completed_at)),
    [progressionQuery.data?.points],
  );
  const recentSessions = useMemo(
    () => [...(historyQuery.data?.items ?? [])].sort((a, b) => timestamp(b.completed_at || b.created_at) - timestamp(a.completed_at || a.created_at)),
    [historyQuery.data?.items],
  );

  const latestPoint = sortedPoints.at(-1);
  const previousPoint = sortedPoints.at(-2);
  const scoreDelta = latestPoint && previousPoint
    ? clampScore(latestPoint.average_score) - clampScore(previousPoint.average_score)
    : null;
  const totalSessions = historyQuery.data?.total ?? 0;
  const activeSession = recentSessions.find((item) => item.status === "active");
  const completedInLoadedHistory = recentSessions.filter((item) => item.status === "completed").length;
  const score = clampScore(Number(user.financial_instinct));
  const level = Math.max(1, Math.floor(Number(user.level) || 1));
  const xp = Math.max(0, Math.floor(Number(user.xp) || 0));
  const xpWithinLevel = xp % 100;

  return (
    <main className="dashboard-main">
      <header className="dashboard-intro">
        <div>
          <span className="eyebrow">RINGKASAN PRIBADI</span>
          <h1>Halo, {user.username}. Ini pola latihanmu.</h1>
          <p>
            Satukan jejak akun, sesi bermain peran, dan kurva perkembangan untuk
            mengetahui langkah belajar yang paling berarti berikutnya.
          </p>
        </div>
        <div className="dashboard-account-chip" aria-label={`Akun ${user.email}`}>
          <span aria-hidden="true">{user.username.trim().charAt(0).toUpperCase() || "F"}</span>
          <div>
            <strong>{user.username}</strong>
            <small>{user.email}</small>
          </div>
        </div>
      </header>

      <section className="dashboard-hero-grid" aria-label="Ringkasan akun dan latihan">
        <div className="profile-card-shell dashboard-instinct-shell">
          <article className="profile-card-core dashboard-instinct-card">
            <div className="dashboard-instinct-copy">
              <span className="dashboard-kicker">
                <ShieldCheck size={18} weight="duotone" aria-hidden="true" />
                Naluri Finansial
              </span>
              <h2>{score >= 71 ? "Kebiasaan kritismu mulai konsisten." : "Setiap sesi membentuk respons yang lebih tenang."}</h2>
              <p>
                Skor ini menggabungkan hasil latihanmu dan bukan penilaian kredit
                atau nasihat keuangan.
              </p>
              <div className="dashboard-instinct-footer">
                <span>Diperbarui {formatDate(user.updated_at)}</span>
                <Link href="/app/profile">Buka profil <ArrowRight size={15} weight="bold" aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="dashboard-gauge-panel">
              <div
                className="dashboard-score-gauge"
                role="img"
                aria-label={`Naluri Finansial ${scoreFormatter.format(score)} dari 100`}
              >
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="dashboard-gauge-track" cx="60" cy="60" r="52" pathLength="100" />
                  <circle
                    className="dashboard-gauge-value"
                    cx="60"
                    cy="60"
                    r="52"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={100 - score}
                  />
                </svg>
                <span><strong>{scoreFormatter.format(score)}</strong><small>/100</small></span>
              </div>
              <small>Skor saat ini</small>
            </div>
          </article>
        </div>

        <div className="dashboard-level-stack">
          <div className="profile-card-shell">
            <article className="profile-card-core dashboard-level-card">
              <span className="dashboard-metric-icon" aria-hidden="true"><Trophy size={23} weight="duotone" /></span>
              <div><span>Level saat ini</span><strong>{numberFormatter.format(level)}</strong></div>
              <small>{numberFormatter.format(100 - xpWithinLevel)} XP menuju level {numberFormatter.format(level + 1)}</small>
              <div className="dashboard-xp-track" role="progressbar" aria-label="Progres menuju level berikutnya" aria-valuemin={0} aria-valuemax={100} aria-valuenow={xpWithinLevel}>
                <span style={{ transform: `scaleX(${xpWithinLevel / 100})` }} />
              </div>
            </article>
          </div>
          <div className="profile-card-shell">
            <article className="profile-card-core dashboard-session-card">
              <span className="dashboard-metric-icon is-navy" aria-hidden="true"><ClockCounterClockwise size={23} weight="duotone" /></span>
              <div><span>Total sesi</span><strong>{historyQuery.isPending ? "…" : numberFormatter.format(totalSessions)}</strong></div>
              <small>{activeSession ? "Ada latihan yang masih berlangsung." : "Semua latihan terbaru sudah ditinjau."}</small>
              {activeSession ? (
                <Link className="dashboard-inline-link" href={`/app/roleplay/${activeSession.session_id}`}>Lanjutkan <ArrowRight size={14} weight="bold" aria-hidden="true" /></Link>
              ) : (
                <Link className="dashboard-inline-link" href="/app/roleplay">Pilih latihan <ArrowRight size={14} weight="bold" aria-hidden="true" /></Link>
              )}
            </article>
          </div>
        </div>
      </section>

      <section className="dashboard-stat-grid" aria-label="Metrik latihan">
        <DashboardStat icon={Target} label="Pengalaman terkumpul" value={`${numberFormatter.format(xp)} XP`} hint={`Level ${numberFormatter.format(level)}`} />
        <DashboardStat icon={ChartLineUp} label="Sesi selesai terbaru" value={historyQuery.isPending ? "…" : numberFormatter.format(completedInLoadedHistory)} hint={historyQuery.data && totalSessions > historyQuery.data.items.length ? "Dari 100 riwayat terakhir" : "Dari riwayat yang dimuat"} />
        <DashboardStat icon={Brain} label="Skor sesi terakhir" value={progressionQuery.isPending ? "…" : latestPoint ? `${scoreFormatter.format(clampScore(latestPoint.average_score))}/100` : "—"} hint={latestPoint ? formatDate(latestPoint.completed_at) : "Belum ada sesi selesai"} />
        <DashboardStat icon={scoreDelta !== null && scoreDelta < 0 ? TrendDown : scoreDelta !== null && scoreDelta > 0 ? TrendUp : Minus} label="Perubahan terakhir" value={progressionQuery.isPending ? "…" : scoreDelta === null ? "—" : `${scoreDelta > 0 ? "+" : ""}${numberFormatter.format(scoreDelta)} poin`} hint={scoreDelta === null ? "Perlu dua sesi untuk membandingkan" : "Dibandingkan sesi sebelumnya"} tone={scoreDelta === null ? "neutral" : scoreDelta > 0 ? "positive" : scoreDelta < 0 ? "negative" : "neutral"} />
      </section>

      <section className="dashboard-analytics-grid" aria-label="Analitik perkembangan dan aktivitas terbaru">
        <div className="profile-card-shell dashboard-chart-shell">
          <article className="profile-card-core dashboard-chart-card">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-heading-icon" aria-hidden="true"><ChartLineUp size={22} weight="duotone" /></span>
                <div>
                  <h2>Lintasan skor</h2>
                  <p>Skor rata-rata dari setiap sesi yang sudah diselesaikan.</p>
                </div>
              </div>
              <Link href="/app/progress" className="dashboard-text-link">Detail progres <ArrowRight size={15} weight="bold" aria-hidden="true" /></Link>
            </div>
            {progressionQuery.isPending ? <ChartSkeleton /> : progressionQuery.isError ? (
              <DashboardQueryState title="Grafik belum dapat dimuat" message={getErrorMessage(progressionQuery.error, "Data perkembangan belum dapat diambil.")} onRetry={() => void progressionQuery.refetch()} isRetrying={progressionQuery.isFetching} />
            ) : sortedPoints.length === 0 ? <DashboardChartEmpty /> : (
              <div className="dashboard-chart" role="img" aria-label={`Grafik ${sortedPoints.length} sesi selesai. Skor terbaru ${clampScore(latestPoint?.average_score ?? 0)} dari 100.`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedPoints} margin={{ top: 16, right: 14, left: -12, bottom: 4 }}>
                    <CartesianGrid stroke="rgba(216, 220, 229, 0.72)" strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="completed_at" axisLine={false} tickLine={false} minTickGap={24} tickFormatter={(value) => formatShortDate(String(value))} tick={{ fill: "#596276", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} width={44} tick={{ fill: "#596276", fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`${scoreFormatter.format(Number(value))} / 100`, "Skor rata-rata"]} labelFormatter={(value) => formatDate(String(value))} contentStyle={{ border: "1px solid rgba(23, 34, 56, 0.12)", borderRadius: "16px", background: "#fcfdf9", boxShadow: "0 16px 40px rgba(23, 34, 56, 0.12)", color: "#172238", fontFamily: "var(--font-geist-mono), monospace", fontSize: "12px" }} labelStyle={{ color: "#596276", marginBottom: "6px" }} />
                    <Line type="monotone" dataKey="average_score" name="Skor rata-rata" stroke="#ff5f57" strokeWidth={3.5} dot={{ r: 4, fill: "#fcfdf9", stroke: "#ff5f57", strokeWidth: 3 }} activeDot={{ r: 7, fill: "#ff5f57", stroke: "#fcfdf9", strokeWidth: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>
        </div>

        <div className="profile-card-shell dashboard-activity-shell">
          <article className="profile-card-core dashboard-activity-card">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-heading-icon is-navy" aria-hidden="true"><Lightning size={22} weight="duotone" /></span>
                <div><h2>Aktivitas terbaru</h2><p>Masuk kembali ke sesi atau tinjau hasil latihanmu.</p></div>
              </div>
            </div>
            {historyQuery.isPending ? <ActivitySkeleton /> : historyQuery.isError ? (
              <DashboardQueryState title="Aktivitas belum dapat dimuat" message={getErrorMessage(historyQuery.error, "Riwayat bermain peran belum dapat diambil.")} onRetry={() => void historyQuery.refetch()} isRetrying={historyQuery.isFetching} compact />
            ) : recentSessions.length === 0 ? <DashboardActivityEmpty /> : (
              <div className="dashboard-activity-list">
                {recentSessions.slice(0, 4).map((item) => <ActivityRow key={item.session_id} item={item} />)}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="dashboard-bottom-grid" aria-label="Informasi akun dan langkah selanjutnya">
        <div className="profile-card-shell">
          <article className="profile-card-core dashboard-account-card">
            <div className="dashboard-section-heading">
              <div><span className="dashboard-heading-icon is-navy" aria-hidden="true"><UserCircle size={22} weight="duotone" /></span><div><h2>Akunmu</h2><p>Data identitas yang terhubung dengan semua progres ini.</p></div></div>
            </div>
            <dl className="dashboard-account-list">
              <div><dt>Nama pengguna</dt><dd>{user.username}</dd></div>
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Bergabung</dt><dd>{formatDate(user.created_at)}</dd></div>
            </dl>
          </article>
        </div>
        <div className="profile-card-shell">
          <article className="profile-card-core dashboard-next-card">
            <span className="dashboard-kicker"><Gauge size={18} weight="duotone" aria-hidden="true" />Langkah berikutnya</span>
            <h2>{activeSession ? "Selesaikan percakapan yang sedang berjalan." : "Pilih satu situasi dan uji responsmu."}</h2>
            <p>{activeSession ? `Sesi “${activeSession.scenario_title}” masih aktif dan siap kamu lanjutkan.` : "Latihan yang konsisten membantu pola keputusan hati-hati terasa lebih alami."}</p>
            <Link href={activeSession ? `/app/roleplay/${activeSession.session_id}` : "/app/roleplay"} className="button button-primary"><span>{activeSession ? "Lanjutkan sesi" : "Mulai latihan"}</span><span className="button-orb" aria-hidden="true"><ArrowRight size={16} weight="bold" /></span></Link>
          </article>
        </div>
      </section>

      <p className="profile-education-note dashboard-education-note"><ShieldCheck size={17} weight="duotone" aria-hidden="true" />Dasbor ini adalah refleksi aktivitas belajarmu di FinLen, bukan penilaian kelayakan kredit atau nasihat keuangan.</p>
    </main>
  );
}

function DashboardStat({ icon: Icon, label, value, hint, tone = "neutral" }: { icon: typeof Target; label: string; value: string; hint: string; tone?: "positive" | "negative" | "neutral" }) {
  return <div className={`profile-card-shell dashboard-stat-shell is-${tone}`}><article className="profile-card-core dashboard-stat-card"><span className="dashboard-stat-icon" aria-hidden="true"><Icon size={20} weight="duotone" /></span><span>{label}</span><strong>{value}</strong><small>{hint}</small></article></div>;
}

function ActivityRow({ item }: { item: RoleplayHistoryItem }) {
  const completed = item.status === "completed";
  return <Link href={`/app/roleplay/${item.session_id}`} className="dashboard-activity-row"><span className={`dashboard-activity-icon is-${item.status}`} aria-hidden="true">{completed ? <CheckCircle size={19} weight="fill" /> : <ClockCounterClockwise size={19} weight="duotone" />}</span><span className="dashboard-activity-copy"><strong>{item.scenario_title}</strong><small>{formatDate(item.completed_at || item.created_at)} · {getStatusLabel(item.status)}</small></span><span className="dashboard-activity-score"><strong>{scoreFormatter.format(clampScore(item.average_score))}</strong><small>/100</small></span><ArrowRight className="dashboard-activity-arrow" size={16} weight="bold" aria-hidden="true" /></Link>;
}

function DashboardQueryState({ title, message, onRetry, isRetrying, compact = false }: { title: string; message: string; onRetry: () => void; isRetrying: boolean; compact?: boolean }) {
  return <div className={`dashboard-query-state ${compact ? "is-compact" : ""}`} role="alert"><span aria-hidden="true"><WarningCircle size={27} weight="duotone" /></span><div><strong>{title}</strong><p>{message}</p></div><button type="button" className="button button-secondary" onClick={onRetry} disabled={isRetrying}><ArrowClockwise size={16} weight="bold" aria-hidden="true" />{isRetrying ? "Mencoba…" : "Coba lagi"}</button></div>;
}

function DashboardChartEmpty() {
  return <div className="dashboard-query-state is-empty"><span aria-hidden="true"><ChartLineUp size={28} weight="duotone" /></span><div><strong>Kurva dimulai setelah sesi pertama.</strong><p>Selesaikan bermain peran untuk menambahkan titik perkembangan.</p></div><Link href="/app/roleplay" className="button button-primary"><span>Mulai latihan</span><span className="button-orb" aria-hidden="true"><ArrowRight size={16} weight="bold" /></span></Link></div>;
}

function DashboardActivityEmpty() {
  return <div className="dashboard-activity-empty"><span aria-hidden="true"><ClockCounterClockwise size={30} weight="duotone" /></span><strong>Belum ada aktivitas.</strong><p>Pilih skenario untuk membuat riwayat latihan pertamamu.</p><Link href="/app/roleplay" className="dashboard-inline-link">Pilih latihan <ArrowRight size={14} weight="bold" aria-hidden="true" /></Link></div>;
}

function ChartSkeleton() {
  return <div className="dashboard-chart-skeleton" role="status"><span className="profile-visually-hidden">Memuat grafik perkembangan…</span><span /><span /><span /><span /><div className="shimmer" /></div>;
}

function ActivitySkeleton() {
  return <div className="dashboard-activity-skeleton" role="status"><span className="profile-visually-hidden">Memuat aktivitas terbaru…</span>{[0, 1, 2, 3].map((index) => <div key={index}><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /></div>)}</div>;
}

function DashboardSkeleton() {
  return <main className="dashboard-main dashboard-skeleton" role="status"><span className="profile-visually-hidden">Memuat dasbor…</span><header className="dashboard-intro"><div><span className="profile-skeleton-line shimmer is-eyebrow" /><span className="profile-skeleton-line shimmer is-heading" /><span className="profile-skeleton-line shimmer is-copy" /></div></header><section className="dashboard-hero-grid"><div className="profile-card-shell"><div className="profile-card-core dashboard-skeleton-hero shimmer" /></div><div className="dashboard-level-stack"><div className="profile-card-shell"><div className="profile-card-core dashboard-skeleton-small shimmer" /></div><div className="profile-card-shell"><div className="profile-card-core dashboard-skeleton-small shimmer" /></div></div></section><section className="dashboard-stat-grid">{[0, 1, 2, 3].map((index) => <div className="profile-card-shell" key={index}><div className="profile-card-core dashboard-skeleton-stat shimmer" /></div>)}</section></main>;
}

function DashboardSignedOutState({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return <main className="profile-main profile-state-main"><section className="profile-state-shell"><div className="profile-state-card"><span className="profile-state-icon" aria-hidden="true"><LockKey size={34} weight="duotone" /></span><span className="profile-card-kicker">DASBOR PRIBADIMU</span><h1>Masuk untuk melihat seluruh jejak belajarmu.</h1><p>Profil, riwayat bermain peran, dan perkembangan Naluri Finansialmu tersimpan aman di akun FinLen.</p><div className="profile-state-actions"><button type="button" className="button button-primary" onClick={onLogin}><span>Masuk</span><span className="button-orb" aria-hidden="true"><ArrowRight size={16} weight="bold" /></span></button><button type="button" className="button button-secondary" onClick={onRegister}>Daftar Gratis</button></div></div></section></main>;
}

function DashboardProfileError({ message, onRetry, isRetrying }: { message: string; onRetry: () => void; isRetrying: boolean }) {
  return <main className="profile-main profile-state-main"><section className="profile-state-shell"><div className="profile-state-card" role="alert"><span className="profile-state-icon is-warning" aria-hidden="true"><WarningCircle size={34} weight="duotone" /></span><span className="profile-card-kicker">KONEKSI TERJEDA</span><h1>Dasbormu belum dapat dimuat.</h1><p>{message}</p><button type="button" className="button button-primary" onClick={onRetry} disabled={isRetrying}><span>{isRetrying ? "Mencoba…" : "Coba Lagi"}</span><span className="button-orb" aria-hidden="true"><ArrowClockwise size={16} weight="bold" /></span></button></div></section></main>;
}
