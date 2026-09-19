"use client";

import { ArrowLeft, CheckCircle, FlagCheckered } from "@phosphor-icons/react";

interface SessionHeaderProps {
  scenarioTitle: string;
  turnNumber: number;
  maxTurns?: number;
  status: "active" | "completed";
  onExit: () => void;
  onComplete?: () => void;
  isCompleting?: boolean;
}

export function SessionHeader({
  scenarioTitle,
  turnNumber,
  maxTurns = 10,
  status,
  onExit,
  onComplete,
  isCompleting = false,
}: SessionHeaderProps) {
  const isCompleted = status === "completed";
  const clampedTurn = Math.min(maxTurns, Math.max(1, turnNumber));
  const isMaxTurn = clampedTurn >= maxTurns && !isCompleted;

  return (
    <header className="roleplay-session-header">
      <div className="session-header-left">
        <button
          type="button"
          className="icon-button session-back-btn"
          onClick={onExit}
          title="Kembali ke pilihan skenario"
          aria-label="Kembali ke pilihan skenario"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>

        <div className="session-title-block">
          <span className="session-eyebrow">Skenario Roleplay Aktif</span>
          <h2 className="session-scenario-title">{scenarioTitle}</h2>
        </div>
      </div>

      <div className="session-header-right">
        <div
          className={`session-turn-badge ${isMaxTurn ? "is-max" : ""}`}
          title={isMaxTurn ? "Giliran keputusan terakhir" : "Giliran keputusan saat ini"}
        >
          <span className="turn-label">Giliran</span>
          <strong className="turn-count font-mono">
            {clampedTurn} <span className="turn-max">/ {maxTurns}</span>
          </strong>
        </div>

        <div className={`session-status-pill ${isCompleted ? "is-completed" : "is-active"}`}>
          {isCompleted ? (
            <>
              <CheckCircle size={14} weight="fill" />
              <span>SELESAI</span>
            </>
          ) : (
            <>
              <span className="active-dot" aria-hidden="true" />
              <span>AKTIF</span>
            </>
          )}
        </div>

        {!isCompleted && onComplete && (() => {
          const MIN_TURNS = 5;
          const canComplete = turnNumber >= MIN_TURNS;
          const turnsRemaining = MIN_TURNS - turnNumber;

          return (
            <button
              type="button"
              className="button button-secondary session-complete-trigger-btn"
              onClick={onComplete}
              disabled={isCompleting || !canComplete}
              title={
                canComplete
                  ? "Akhiri sesi dan hitung skor akhir Naluri Finansial"
                  : `Minimal ${MIN_TURNS} giliran diperlukan (${turnsRemaining} lagi)`
              }
            >
              <FlagCheckered size={16} weight="bold" />
              <span>{isCompleting ? "Menyelesaikan..." : "Selesaikan Sesi"}</span>
            </button>
          );
        })()}
      </div>
    </header>
  );
}
