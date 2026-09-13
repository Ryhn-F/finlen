"use client";

import { Coins } from "@phosphor-icons/react";
import type { FinancialTerms } from "@/lib/types/analyzer";
import { humanizeInterestPeriod } from "@/lib/utils/analyzer";
import {
  formatCurrency,
  formatIndonesianDate,
  formatPercentage,
} from "@/lib/utils/format";

export interface FinancialTermsCardProps {
  terms: FinancialTerms;
}

const NOT_DETECTED = "Tidak terdeteksi";

interface TermRow {
  label: string;
  value: string;
  caption?: string;
  detected: boolean;
}

function buildRows(terms: FinancialTerms): TermRow[] {
  const principalDetected =
    typeof terms.principal === "number" && Number.isFinite(terms.principal);
  const rateDetected =
    typeof terms.interest_rate === "number" &&
    Number.isFinite(terms.interest_rate);
  const periodLabel = terms.interest_period
    ? humanizeInterestPeriod(terms.interest_period)
    : null;

  return [
    {
      label: "Pokok Pinjaman",
      value: principalDetected
        ? formatCurrency(terms.principal as number, terms.currency)
        : NOT_DETECTED,
      detected: principalDetected,
    },
    {
      label: "Bunga",
      value: rateDetected
        ? periodLabel
          ? `${formatPercentage(terms.interest_rate as number)} / ${periodLabel}`
          : formatPercentage(terms.interest_rate as number)
        : NOT_DETECTED,
      caption:
        !rateDetected && periodLabel ? `Periode: per ${periodLabel}` : undefined,
      detected: rateDetected,
    },
    {
      label: "Jatuh Tempo",
      value: terms.due_date ? formatIndonesianDate(terms.due_date) : NOT_DETECTED,
      detected: Boolean(terms.due_date),
    },
    {
      label: "Mata Uang",
      value: terms.currency ? terms.currency.toUpperCase() : NOT_DETECTED,
      detected: Boolean(terms.currency),
    },
  ];
}

export function FinancialTermsCard({ terms }: FinancialTermsCardProps) {
  const rows = buildRows(terms);
  const detectedCount = rows.filter((row) => row.detected).length;

  return (
    <section className="analysis-card" aria-labelledby="analysis-terms-title">
      <header className="analysis-card-head">
        <span className="analysis-card-icon" aria-hidden="true">
          <Coins size={22} weight="duotone" />
        </span>
        <div>
          <h2 id="analysis-terms-title">Istilah Finansial</h2>
          <p>Angka yang FinLen temukan langsung di dalam dokumen.</p>
        </div>
      </header>

      <dl className="terms-grid">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`term-item ${row.detected ? "" : "is-missing"}`}
          >
            <dt className="term-label">{row.label}</dt>
            <dd className="term-value">
              {row.value}
              {row.caption ? (
                <small className="term-caption">{row.caption}</small>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>

      {detectedCount === 0 ? (
        <p className="analysis-card-empty">
          FinLen belum menemukan angka finansial yang jelas pada dokumen ini.
          Periksa kembali dokumen aslinya sebelum mengambil keputusan.
        </p>
      ) : null}
    </section>
  );
}

export default FinancialTermsCard;
