"use client";

import { CheckSquareOffset, ListChecks } from "@phosphor-icons/react";

export interface RecommendedActionsCardProps {
  actions: string[];
}

export function RecommendedActionsCard({
  actions,
}: RecommendedActionsCardProps) {
  return (
    <section className="analysis-card" aria-labelledby="analysis-actions-title">
      <header className="analysis-card-head">
        <span className="analysis-card-icon" aria-hidden="true">
          <ListChecks size={22} weight="duotone" />
        </span>
        <div>
          <h2 id="analysis-actions-title">Yang Sebaiknya Kamu Lakukan</h2>
          <p>Langkah pemeriksaan sebelum kamu mengambil keputusan.</p>
        </div>
      </header>

      {actions.length > 0 ? (
        <ul className="action-list">
          {actions.map((action, index) => (
            <li key={`${index}-${action}`} className="action-item">
              <CheckSquareOffset size={19} weight="bold" aria-hidden="true" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="analysis-card-empty">
          Belum ada langkah khusus yang direkomendasikan dari dokumen ini.
          Periksa kembali seluruh biaya dan ketentuan pembayaran pada dokumen
          aslinya.
        </p>
      )}
    </section>
  );
}

export default RecommendedActionsCard;
