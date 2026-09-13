"use client";

import { ShieldWarning } from "@phosphor-icons/react";
import type { RiskFactor } from "@/lib/types/analyzer";
import { RISK_SEVERITY_LABELS } from "@/lib/utils/analyzer";

export interface RiskFactorsCardProps {
  factors: RiskFactor[];
}

export function RiskFactorsCard({ factors }: RiskFactorsCardProps) {
  return (
    <section
      className="analysis-card"
      aria-labelledby="analysis-risk-factors-title"
    >
      <header className="analysis-card-head">
        <span className="analysis-card-icon" aria-hidden="true">
          <ShieldWarning size={22} weight="duotone" />
        </span>
        <div>
          <h2 id="analysis-risk-factors-title">Faktor Risiko</h2>
          <p>Ketentuan yang dapat memperbesar beban pembayaranmu.</p>
        </div>
        {factors.length > 0 ? (
          <span className="analysis-card-count">{factors.length}</span>
        ) : null}
      </header>

      {factors.length > 0 ? (
        <ul className="risk-factor-list">
          {factors.map((factor, index) => (
            <li
              key={`${index}-${factor.title}`}
              className={`risk-factor-item is-${factor.severity}`}
            >
              <div className="risk-factor-head">
                <h3 className="risk-factor-title">
                  {factor.title || "Faktor risiko"}
                </h3>
                <span className={`severity-tag is-${factor.severity}`}>
                  {RISK_SEVERITY_LABELS[factor.severity]}
                </span>
              </div>
              {factor.description ? (
                <p className="risk-factor-desc">{factor.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="analysis-card-empty">
          Tidak ada faktor risiko spesifik yang terdeteksi dari dokumen ini.
        </p>
      )}
    </section>
  );
}

export default RiskFactorsCard;
