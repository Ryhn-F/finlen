"use client";

import { Flag, WarningDiamond } from "@phosphor-icons/react";

export interface RedFlagsCardProps {
  redFlags: string[];
}

export function RedFlagsCard({ redFlags }: RedFlagsCardProps) {
  const hasFlags = redFlags.length > 0;

  return (
    <section
      className={`analysis-card red-flags-card ${hasFlags ? "has-flags" : ""}`}
      aria-labelledby="analysis-red-flags-title"
    >
      <header className="analysis-card-head">
        <span className="analysis-card-icon is-alert" aria-hidden="true">
          <Flag size={22} weight="duotone" />
        </span>
        <div>
          <h2 id="analysis-red-flags-title">Red Flags</h2>
          <p>Hal berprioritas tinggi yang FinLen temukan pada dokumen ini.</p>
        </div>
        {hasFlags ? (
          <span className="analysis-card-count">{redFlags.length}</span>
        ) : null}
      </header>

      {hasFlags ? (
        <ul className="red-flag-list">
          {redFlags.map((flag, index) => (
            <li key={`${index}-${flag}`} className="red-flag-item">
              <WarningDiamond size={18} weight="fill" aria-hidden="true" />
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="analysis-card-empty">
          <p>
            Tidak ada red flag yang terdeteksi berdasarkan analisis dokumen.
          </p>
          <p className="analysis-card-empty-note">
            Ini bukan jaminan bahwa dokumen aman. Tetap baca seluruh ketentuan
            sebelum menyetujui atau membayar.
          </p>
        </div>
      )}
    </section>
  );
}

export default RedFlagsCard;
