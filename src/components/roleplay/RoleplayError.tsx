"use client";

import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";

interface RoleplayErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function RoleplayError({
  title = "Terjadi Kesalahan",
  message,
  onRetry,
  retryLabel = "Coba Lagi",
}: RoleplayErrorProps) {
  return (
    <div className="roleplay-error-card" role="alert">
      <div className="error-icon-wrap" aria-hidden="true">
        <WarningCircle size={28} weight="duotone" />
      </div>
      <div className="error-content">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="button button-secondary error-retry-btn"
          onClick={onRetry}
        >
          <ArrowClockwise size={16} weight="bold" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
