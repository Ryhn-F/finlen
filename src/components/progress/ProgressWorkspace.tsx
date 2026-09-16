"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowClockwise,
  ArrowRight,
  Brain,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartLineUp,
  CheckCircle,
  ClockCounterClockwise,
  Lightning,
  LockKey,
  Minus,
  ShieldCheck,
  ClipboardTextIcon, 
  Target,
  TrendDown,
  TrendUp,
  Trophy,
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
import {
  ROLEPLAY_QUERY_KEYS,
  useRoleplayHistory,
  useRoleplayHistoryDetail,
  useRoleplayProgression,
} from "@/lib/hooks/useRoleplay";
import type {
  RoleplayHistoryItem,
  SessionScores,
  UserResponse,
} from "@/lib/types/roleplay";

const HISTORY_PAGE_SIZE = 8;
const PROGRESSION_LIMIT = 100;

const numberFormatter = new Intl.NumberFormat("id-ID");
const scoreFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});
const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
});
const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const SKILL_ITEMS: Array<{
  key: keyof Pick<
    SessionScores,
    | "critical_thinking"
    | "risk_awareness"
    | "impulse_control"
    | "decision_making"
  >;
  label: string;
  icon: ComponentType<IconProps>;
}> = [
  { key: "critical_thinking", label: "Berpikir Kritis", icon: Brain },
  { key: "risk_awareness", label: "Kesadaran Risiko", icon: ShieldCheck },
  { key: "impulse_control", label: "Kontrol Impulsif", icon: Lightning },
  { key: "decision_making", label: "Pengambilan Keputusan", icon: Target },
];

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : shortDateFormatter.format(date);
}

function formatDateTime(value: string | null): string {
  if (!value) return "Belum selesai";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : dateTimeFormatter.format(date);
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "Masih berlangsung";
  const duration = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(duration) || duration < 0) return "Durasi tidak tersedia";
  const minutes = Math.max(1, Math.round(duration / 60_000));
  return `${numberFormatter.format(minutes)} menit`;
}

function getErrorMessage(error: Error | null, fallback: string): string {
  if (error instanceof ApiError) return error.userMessage;
  return fallback;
}

function getStatusLabel(status: string): string {
  if (status === "completed") return "Selesai";
  if (status === "active") return "Berlangsung";
  return status.replaceAll("_", " ");
}

export function ProgressWorkspace() {
  const {
    user,
    isLoading,
    isAuthenticated,
    isRefreshing,
    refreshUser,
    openAuthModal,
  } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();
  const [isRefreshingPage, setIsRefreshingPage] = useState(false);

  const handleSidebarToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen((previous) => !previous);
    } else {
      setSidebarMinimized((previous) => !previous);
    }
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
        activeItemId="progress"
        user={{
          name: user?.username || "Tamu FinLen",
          role: user ? `Level ${user.level} · ${user.xp} XP` : "Progres tersimpan",
          profileHref: "/app/profile",
        }}
      />

      <div className="app-main">
        <AppTopbar
          title="Progres"
          subtitle="Jejak Latihanmu"
          onToggleSidebar={handleSidebarToggle}
          actions={
            isLoading ? null : isAuthenticated ? (
              <button
                type="button"
                className={`button button-secondary progress-refresh-button ${refreshPending ? "is-refreshing" : ""}`}
                onClick={() => void handleRefresh()}
                disabled={refreshPending}
                aria-label={refreshPending ? "Sedang memperbarui progres" : "Perbarui progres"}
              >
                <ArrowClockwise size={17} weight="bold" aria-hidden="true" />
                <span>{refreshPending ? "Memperbarui…" : "Perbarui"}</span>
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary progress-topbar-login"
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
          <ProgressSkeleton />
        ) : !isAuthenticated ? (
          <ProgressSignedOutState
            onLogin={() => openAuthModal("login")}
            onRegister={() => openAuthModal("register")}
          />
        ) : (
          <ProgressDashboard user={user} />
        )}
      </div>

      <AuthModal />
    </div>
  );
}

function ProgressDashboard({ user }: { user: UserResponse | null }) {
  const [offset, setOffset] = useState(0);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const historyQuery = useRoleplayHistory({
    limit: HISTORY_PAGE_SIZE,
    offset,
  });
  const progressionQuery = useRoleplayProgression(PROGRESSION_LIMIT);
  const detailQuery = useRoleplayHistoryDetail(selectedSessionId);

  const points = progressionQuery.data?.points ?? [];
  const latestPoint = points[points.length - 1];
  const firstPoint = points[0];
  const bestScore = points.length
    ? Math.max(...points.map((point) => clampScore(point.average_score)))
    : null;
  const scoreChange = latestPoint && firstPoint
    ? clampScore(latestPoint.average_score) - clampScore(firstPoint.average_score)
    : 0;
  const totalSessions = historyQuery.data?.total ?? 0;
  const page = Math.floor(offset / HISTORY_PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalSessions / HISTORY_PAGE_SIZE));

  const handlePageChange = (nextOffset: number) => {
    setOffset(Math.max(0, nextOffset));
    setSelectedSessionId(null);
  };

  return (
    <main className="progress-main">
      <header className="progress-intro">
        <span className="eyebrow">JEJAK PERKEMBANGAN</span>
        <h1>Lihat cara nalurimu bertumbuh.</h1>
        <p>
          Setiap percakapan adalah satu titik latihan. Amati polanya, buka hasil
          sesi, lalu tentukan kemampuan yang ingin kamu asah berikutnya.
        </p>
      </header>

      <section className="progress-overview-grid" aria-label="Ringkasan perkembangan">
        <div className="profile-card-shell progress-chart-shell">
          <article className="profile-card-core progress-chart-card">
            <div className="progress-section-heading">
              <div>
                <span className="progress-heading-icon" aria-hidden="true">
                  <ChartLineUp size={22} weight="duotone" />
                </span>
                <div>
                  <h2>Kurva Naluri Finansial</h2>
                  <p>Skor komposit dari sesi selesai, berurutan dari waktu ke waktu.</p>
                </div>
              </div>
              {points.length > 1 && (
                <span className={`progress-trend is-${scoreChange > 0 ? "up" : scoreChange < 0 ? "down" : "steady"}`}>
                  {scoreChange > 0 ? (
                    <TrendUp size={15} weight="bold" aria-hidden="true" />
                  ) : scoreChange < 0 ? (
                    <TrendDown size={15} weight="bold" aria-hidden="true" />
                  ) : (
                    <Minus size={15} weight="bold" aria-hidden="true" />
                  )}
                  {scoreChange > 0 ? "+" : ""}{numberFormatter.format(scoreChange)} poin
                </span>
              )}
            </div>

            {progressionQuery.isPending ? (
              <ChartSkeleton />
            ) : progressionQuery.isError ? (
              <ProgressSectionError
                title="Kurva belum dapat dimuat"
                message={getErrorMessage(
                  progressionQuery.error,
                  "Data perkembangan belum dapat diambil. Coba beberapa saat lagi.",
                )}
                onRetry={() => void progressionQuery.refetch()}
                isRetrying={progressionQuery.isFetching}
              />
            ) : points.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <div
                className="progress-chart"
                role="img"
                aria-label={`Grafik perkembangan dari ${points.length} sesi selesai. Skor terbaru ${clampScore(latestPoint.average_score)} dari 100.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={points}
                    margin={{ top: 16, right: 18, left: -12, bottom: 4 }}
                  >
                    <CartesianGrid
                      stroke="rgba(216, 220, 229, 0.72)"
                      strokeDasharray="4 6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="completed_at"
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                      tickFormatter={(value) => formatShortDate(String(value))}
                      tick={{ fill: "#596276", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                      tick={{ fill: "#596276", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${scoreFormatter.format(Number(value))} / 100`, "Skor rata-rata"]}
                      labelFormatter={(value) => formatDateTime(String(value))}
                      contentStyle={{
                        border: "1px solid rgba(23, 34, 56, 0.12)",
                        borderRadius: "16px",
                        background: "#fcfdf9",
                        boxShadow: "0 16px 40px rgba(23, 34, 56, 0.12)",
                        color: "#172238",
                        fontFamily: "var(--font-geist-mono), monospace",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#596276", marginBottom: "6px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="average_score"
                      name="Skor rata-rata"
                      stroke="#ff5f57"
                      strokeWidth={3.5}
                      dot={{ r: 4, fill: "#fcfdf9", stroke: "#ff5f57", strokeWidth: 3 }}
                      activeDot={{ r: 7, fill: "#ff5f57", stroke: "#fcfdf9", strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>
        </div>

        <aside className="profile-card-shell progress-summary-shell" aria-label="Statistik utama">
          <div className="profile-card-core progress-summary-card">
            <div className="progress-primary-score">
              <span className="progress-summary-icon" aria-hidden="true">
                <ClipboardTextIcon size={24} weight="duotone" />
              </span>
              <span>Skor sesi terbaru</span>
              <strong>{latestPoint ? scoreFormatter.format(clampScore(latestPoint.average_score)) : "—"}</strong>
              <small>dari 100 poin</small>
            </div>

            <dl className="progress-summary-list">
              <div>
                <dt><ClockCounterClockwise size={18} weight="duotone" aria-hidden="true" />Total sesi</dt>
                <dd>{historyQuery.isPending ? "…" : numberFormatter.format(totalSessions)}</dd>
              </div>
              <div>
                <dt><Trophy size={18} weight="duotone" aria-hidden="true" />Skor terbaik</dt>
                <dd>{bestScore === null ? "—" : numberFormatter.format(bestScore)}</dd>
              </div>
              <div>
                <dt><Target size={18} weight="duotone" aria-hidden="true" />Total XP</dt>
                <dd>{user ? numberFormatter.format(user.xp) : "—"}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      <section className="profile-card-shell progress-history-shell" aria-labelledby="history-title">
        <div className="profile-card-core progress-history-card">
          <div className="progress-history-heading">
            <div>
              <span className="progress-heading-icon is-navy" aria-hidden="true">
                <ClockCounterClockwise size={22} weight="duotone" />
              </span>
              <div>
                <h2 id="history-title">Riwayat bermain peran</h2>
                <p>Buka setiap sesi untuk melihat empat kemampuan pembentuk skormu.</p>
              </div>
            </div>
            {!historyQuery.isPending && !historyQuery.isError && (
              <span className="progress-history-count">
                {numberFormatter.format(totalSessions)} sesi
              </span>
            )}
          </div>

          {historyQuery.isPending ? (
            <HistorySkeleton />
          ) : historyQuery.isError ? (
            <ProgressSectionError
              title="Riwayat belum dapat dimuat"
              message={getErrorMessage(
                historyQuery.error,
                "Riwayat latihanmu belum dapat diambil. Coba beberapa saat lagi.",
              )}
              onRetry={() => void historyQuery.refetch()}
              isRetrying={historyQuery.isFetching}
            />
          ) : historyQuery.data.items.length === 0 && historyQuery.data.total === 0 ? (
            <HistoryEmptyState />
          ) : (
            <>
              <div className={`progress-history-list ${historyQuery.isFetching ? "is-updating" : ""}`}>
                {historyQuery.data.items.map((item) => (
                  <HistoryRow
                    key={item.session_id}
                    item={item}
                    isSelected={selectedSessionId === item.session_id}
                    onToggle={() =>
                      setSelectedSessionId((current) =>
                        current === item.session_id ? null : item.session_id,
                      )
                    }
                    detailQuery={selectedSessionId === item.session_id ? detailQuery : null}
                  />
                ))}
              </div>

              <nav className="progress-pagination" aria-label="Navigasi halaman riwayat">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handlePageChange(offset - HISTORY_PAGE_SIZE)}
                  disabled={offset === 0 || historyQuery.isFetching}
                >
                  <CaretLeft size={16} weight="bold" aria-hidden="true" />
                  Sebelumnya
                </button>
                <span>
                  Halaman <strong>{numberFormatter.format(page)}</strong> dari {numberFormatter.format(totalPages)}
                </span>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handlePageChange(offset + HISTORY_PAGE_SIZE)}
                  disabled={offset + historyQuery.data.limit >= historyQuery.data.total || historyQuery.isFetching}
                >
                  Berikutnya
                  <CaretRight size={16} weight="bold" aria-hidden="true" />
                </button>
              </nav>
            </>
          )}
        </div>
      </section>

      <p className="profile-education-note progress-education-note">
        <ShieldCheck size={17} weight="duotone" aria-hidden="true" />
        Progres ini adalah refleksi dari latihanmu di FinLen, bukan penilaian
        kelayakan kredit atau nasihat keuangan.
      </p>
    </main>
  );
}

function HistoryRow({
  item,
  isSelected,
  onToggle,
  detailQuery,
}: {
  item: RoleplayHistoryItem;
  isSelected: boolean;
  onToggle: () => void;
  detailQuery: ReturnType<typeof useRoleplayHistoryDetail> | null;
}) {
  const score = clampScore(item.average_score);

  return (
    <article className={`progress-history-item ${isSelected ? "is-open" : ""}`}>
      <button
        type="button"
        className="progress-history-summary"
        onClick={onToggle}
        aria-expanded={isSelected}
        aria-controls={`history-detail-${item.session_id}`}
      >
        <span className="progress-history-date" aria-hidden="true">
          <CalendarBlank size={18} weight="duotone" />
          <strong>{formatShortDate(item.completed_at || item.created_at)}</strong>
        </span>
        <span className="progress-history-copy">
          <strong>{item.scenario_title}</strong>
          <small>{formatDateTime(item.completed_at || item.created_at)}</small>
        </span>
        <span className={`progress-status is-${item.status}`}>
          {item.status === "completed" && <CheckCircle size={14} weight="fill" aria-hidden="true" />}
          {getStatusLabel(item.status)}
        </span>
        <span className="progress-history-xp">+{numberFormatter.format(item.xp_earned)} XP</span>
        <span className="progress-history-score">
          <strong>{scoreFormatter.format(score)}</strong>
          <small>/100</small>
        </span>
        <span className="progress-history-caret" aria-hidden="true">
          <CaretDown size={17} weight="bold" />
        </span>
      </button>

      {isSelected && (
        <div className="progress-history-detail" id={`history-detail-${item.session_id}`}>
          {detailQuery?.isPending ? (
            <div className="progress-detail-loading" role="status">
              <span className="progress-mini-spinner" aria-hidden="true" />
              Membuka hasil sesi…
            </div>
          ) : detailQuery?.isError ? (
            <ProgressSectionError
              title="Detail sesi belum dapat dibuka"
              message={getErrorMessage(
                detailQuery.error,
                "Hasil sesi ini belum dapat diambil.",
              )}
              onRetry={() => void detailQuery.refetch()}
              isRetrying={detailQuery.isFetching}
              compact
            />
          ) : detailQuery?.data ? (
            <div className="progress-detail-grid">
              <div className="progress-skill-list">
                {SKILL_ITEMS.map(({ key, label, icon: Icon }) => {
                  const value = clampScore(detailQuery.data.scores[key]);
                  return (
                    <div className="progress-skill" key={key}>
                      <div>
                        <span><Icon size={16} weight="duotone" aria-hidden="true" />{label}</span>
                        <strong>{numberFormatter.format(value)}</strong>
                      </div>
                      <div
                        className="progress-skill-track"
                        role="progressbar"
                        aria-label={`${label}: ${value} dari 100`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={value}
                      >
                        <span style={{ transform: `scaleX(${value / 100})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <dl className="progress-detail-meta">
                <div>
                  <dt>Durasi sesi</dt>
                  <dd>{formatDuration(detailQuery.data.created_at, detailQuery.data.completed_at)}</dd>
                </div>
                <div>
                  <dt>Skor komposit</dt>
                  <dd>{numberFormatter.format(clampScore(detailQuery.data.average_score))} / 100</dd>
                </div>
                <div>
                  <dt>Pengalaman</dt>
                  <dd>+{numberFormatter.format(detailQuery.data.xp_earned)} XP</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}

function ProgressSectionError({
  title,
  message,
  onRetry,
  isRetrying,
  compact = false,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`progress-section-state is-error ${compact ? "is-compact" : ""}`} role="alert">
      <span className="progress-state-icon" aria-hidden="true">
        <WarningCircle size={28} weight="duotone" />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <button type="button" className="button button-secondary" onClick={onRetry} disabled={isRetrying}>
        <ArrowClockwise size={16} weight="bold" aria-hidden="true" />
        {isRetrying ? "Mencoba…" : "Coba lagi"}
      </button>
    </div>
  );
}

function ChartEmptyState() {
  return (
    <div className="progress-section-state is-empty">
      <span className="progress-state-icon" aria-hidden="true">
        <ChartLineUp size={30} weight="duotone" />
      </span>
      <div>
        <strong>Kurvamu dimulai setelah sesi pertama.</strong>
        <p>Selesaikan bermain peran untuk membuat titik perkembangan pertamamu.</p>
      </div>
      <Link href="/app/roleplay" className="button button-primary">
        <span>Mulai latihan</span>
        <span className="button-orb" aria-hidden="true">
          <ArrowRight size={16} weight="bold" />
        </span>
      </Link>
    </div>
  );
}

function HistoryEmptyState() {
  return (
    <div className="progress-history-empty">
      <span aria-hidden="true"><ClockCounterClockwise size={34} weight="duotone" /></span>
      <h3>Belum ada sesi dalam riwayatmu.</h3>
      <p>Pilih skenario dan latih cara merespons situasi finansial yang menantang.</p>
      <Link href="/app/roleplay" className="button button-primary">
        <span>Pilih skenario</span>
        <span className="button-orb" aria-hidden="true">
          <ArrowRight size={16} weight="bold" />
        </span>
      </Link>
    </div>
  );
}

function ProgressSignedOutState({
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
          <span className="profile-card-kicker">JEJAK PRIBADIMU</span>
          <h1>Masuk untuk melihat perkembangan latihanmu.</h1>
          <p>
            Kurva skor dan riwayat bermain peran tersimpan di akunmu agar dapat
            kamu tinjau kapan saja.
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

function ChartSkeleton() {
  return (
    <div className="progress-chart-skeleton" role="status" aria-live="polite">
      <span className="profile-visually-hidden">Memuat kurva perkembangan…</span>
      <div className="progress-chart-skeleton-grid" aria-hidden="true">
        <span /><span /><span /><span />
        <div className="progress-chart-skeleton-line shimmer" />
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="progress-history-skeleton" role="status" aria-live="polite">
      <span className="profile-visually-hidden">Memuat riwayat bermain peran…</span>
      {[0, 1, 2, 3].map((item) => (
        <div className="progress-history-skeleton-row" key={item} aria-hidden="true">
          <span className="shimmer" />
          <div><span className="shimmer" /><span className="shimmer" /></div>
          <span className="shimmer" />
        </div>
      ))}
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <main className="progress-main progress-skeleton" role="status" aria-live="polite">
      <span className="profile-visually-hidden">Memuat progres dan riwayat latihanmu…</span>
      <header className="progress-intro" aria-hidden="true">
        <div className="profile-skeleton-line shimmer is-eyebrow" />
        <div className="profile-skeleton-line shimmer is-heading" />
        <div className="profile-skeleton-line shimmer is-copy" />
      </header>
      <section className="progress-overview-grid" aria-hidden="true">
        <div className="profile-card-shell progress-chart-shell">
          <div className="profile-card-core progress-chart-card"><ChartSkeleton /></div>
        </div>
        <div className="profile-card-shell progress-summary-shell">
          <div className="profile-card-core progress-summary-card">
            <div className="progress-skeleton-score shimmer" />
            <div className="progress-skeleton-stat shimmer" />
            <div className="progress-skeleton-stat shimmer" />
            <div className="progress-skeleton-stat shimmer" />
          </div>
        </div>
      </section>
      <section className="profile-card-shell progress-history-shell" aria-hidden="true">
        <div className="profile-card-core progress-history-card"><HistorySkeleton /></div>
      </section>
    </main>
  );
}
