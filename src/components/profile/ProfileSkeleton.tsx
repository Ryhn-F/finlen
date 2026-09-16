export function ProfileSkeleton() {
  return (
    <main className="profile-main profile-skeleton" role="status" aria-live="polite">
      <span className="profile-visually-hidden">
        Memuat profil dan progres Naluri Finansialmu…
      </span>

      <header className="profile-intro" aria-hidden="true">
        <div className="profile-skeleton-line shimmer is-eyebrow" />
        <div className="profile-skeleton-line shimmer is-heading" />
        <div className="profile-skeleton-line shimmer is-copy" />
      </header>

      <section className="profile-overview-grid" aria-hidden="true">
        <div className="profile-card-shell profile-instinct-shell">
          <div className="profile-card-core profile-skeleton-card is-instinct">
            <div className="profile-skeleton-stack">
              <div className="profile-skeleton-line shimmer is-label" />
              <div className="profile-skeleton-line shimmer is-card-title" />
              <div className="profile-skeleton-line shimmer is-card-copy" />
              <div className="profile-skeleton-line shimmer is-card-copy short" />
            </div>
            <div className="profile-skeleton-ring shimmer" />
          </div>
        </div>

        <div className="profile-side-stack">
          <div className="profile-card-shell">
            <div className="profile-card-core profile-skeleton-card">
              <div className="profile-skeleton-icon shimmer" />
              <div className="profile-skeleton-line shimmer is-label" />
              <div className="profile-skeleton-line shimmer is-stat" />
            </div>
          </div>
          <div className="profile-card-shell">
            <div className="profile-card-core profile-skeleton-card">
              <div className="profile-skeleton-line shimmer is-label" />
              <div className="profile-skeleton-line shimmer is-stat wide" />
              <div className="profile-skeleton-progress shimmer" />
            </div>
          </div>
        </div>
      </section>

      <section className="profile-detail-grid" aria-hidden="true">
        <div className="profile-card-shell">
          <div className="profile-card-core profile-skeleton-card is-detail">
            <div className="profile-skeleton-line shimmer is-card-title" />
            <div className="profile-skeleton-row shimmer" />
            <div className="profile-skeleton-row shimmer" />
            <div className="profile-skeleton-row shimmer" />
          </div>
        </div>
        <div className="profile-card-shell">
          <div className="profile-card-core profile-skeleton-card is-detail">
            <div className="profile-skeleton-line shimmer is-card-title" />
            <div className="profile-skeleton-row shimmer" />
            <div className="profile-skeleton-row shimmer" />
            <div className="profile-skeleton-row shimmer" />
          </div>
        </div>
      </section>
    </main>
  );
}
