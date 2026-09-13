"use client";

import { useRouter } from "next/navigation";
import { ArrowClockwise, ArrowLeft, WarningCircle } from "@phosphor-icons/react";

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

function ScenarioErrorState({ title, message }: { title: string; message: string }) {
  const router = useRouter();

  return (
    <div className="scenario-error-state">
      <RoleplayError title={title} message={message} />
      <button
        type="button"
        className="button button-secondary scenario-error-back-btn"
        onClick={() => router.push("/app/roleplay")}
      >
        <ArrowLeft size={16} weight="bold" />
        <span>Kembali ke Daftar Skenario</span>
      </button>
    </div>
  );
}

export function ScenarioNotFoundState() {
  return (
    <ScenarioErrorState
      title="Skenario Tidak Ditemukan"
      message="Skenario yang kamu cari tidak tersedia atau sudah tidak aktif."
    />
  );
}

export function ScenarioInvalidState() {
  return (
    <ScenarioErrorState
      title="Alamat Skenario Tidak Valid"
      message="Alamat skenario ini tidak valid. Periksa kembali tautan yang kamu gunakan."
    />
  );
}
