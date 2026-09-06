"use client";

export function ScenarioCardSkeleton() {
  return (
    <div className="scenario-card is-skeleton" aria-hidden="true">
      <div className="skeleton-badge shimmer" />
      <div className="skeleton-title shimmer" />
      <div className="skeleton-desc shimmer" />
      <div className="skeleton-desc short shimmer" />
      <div className="scenario-card-meta">
        <div className="skeleton-role shimmer" />
        <div className="skeleton-turns shimmer" />
      </div>
      <div className="skeleton-btn shimmer" />
    </div>
  );
}

export function ScenarioListSkeleton() {
  return (
    <div className="scenario-grid" aria-label="Memuat daftar skenario" role="status">
      <ScenarioCardSkeleton />
      <ScenarioCardSkeleton />
      <ScenarioCardSkeleton />
      <ScenarioCardSkeleton />
    </div>
  );
}

export function RoleplayChatSkeleton() {
  return (
    <div className="roleplay-chat-skeleton" aria-label="Memuat percakapan" role="status">
      <div className="chat-msg-skeleton is-npc shimmer">
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
      <div className="chat-msg-skeleton is-user shimmer">
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
      </div>
      <div className="chat-msg-skeleton is-npc shimmer">
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}

export function RoleplayStatsSkeleton() {
  return (
    <div className="roleplay-stats-skeleton shimmer" aria-hidden="true">
      <div className="skeleton-line title" />
      <div className="skeleton-stat-bar" />
      <div className="skeleton-stat-bar" />
      <div className="skeleton-stat-bar" />
      <div className="skeleton-stat-bar" />
    </div>
  );
}
