"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ChartLineUp,
  FileText,
  SealCheck,
  UploadSimple,
} from "@phosphor-icons/react";
import type { DocumentAnalysis } from "@/lib/types/analyzer";
import {
  RISK_LEVEL_DESCRIPTIONS,
  buildSimulatorBridge,
  humanizeDocumentType,
} from "@/lib/utils/analyzer";
import { RiskLevelBadge } from "./RiskLevelBadge";
import { FinancialTermsCard } from "./FinancialTermsCard";
import { RedFlagsCard } from "./RedFlagsCard";
import { RiskFactorsCard } from "./RiskFactorsCard";
import { RecommendedActionsCard } from "./RecommendedActionsCard";
import { FinancialLiteracyCard } from "./FinancialLiteracyCard";

export interface AnalysisResultProps {
  analysis: DocumentAnalysis;
  fileName: string;
  onAnalyzeAnother: () => void;
}

function Reveal({ index, children }: { index: number; children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.44,
        delay: Math.min(index * 0.07, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnalysisResult({
  analysis,
  fileName,
  onAnalyzeAnother,
}: AnalysisResultProps) {
  const documentTypeLabel = humanizeDocumentType(analysis.document_type);
  const bridge = buildSimulatorBridge(analysis.financial_terms);

  return (
    <div className="analysis-result">
      <Reveal index={0}>
        <section className="analysis-header" aria-labelledby="analysis-title">
          <div className="analysis-header-main">
            <span className="analysis-header-eyebrow">
              <SealCheck size={16} weight="fill" aria-hidden="true" />
              Analisis selesai
            </span>
            <h1 id="analysis-title">Dokumen berhasil dianalisis</h1>
            <p className="analysis-header-sub">
              Berikut hal-hal penting yang perlu kamu pahami sebelum mengambil
              keputusan.
            </p>
            <p className="analysis-header-file">
              <FileText size={16} weight="duotone" aria-hidden="true" />
              <span className="analysis-header-doctype">
                {documentTypeLabel}
              </span>
              <span className="analysis-header-filename" title={fileName}>
                {fileName}
              </span>
            </p>
          </div>

          <div className="analysis-header-risk">
            <RiskLevelBadge level={analysis.risk_level} size="large" />
            <p>{RISK_LEVEL_DESCRIPTIONS[analysis.risk_level]}</p>
          </div>
        </section>
      </Reveal>

      <Reveal index={1}>
        <section
          className="analysis-card summary-card"
          aria-labelledby="analysis-summary-title"
        >
          <header className="analysis-card-head">
            <span className="analysis-card-icon" aria-hidden="true">
              <FileText size={22} weight="duotone" />
            </span>
            <div>
              <h2 id="analysis-summary-title">Ringkasan</h2>
              <p>Penjelasan isi dokumen dalam bahasa sehari-hari.</p>
            </div>
          </header>
          {analysis.summary ? (
            <p className="analysis-summary-text">{analysis.summary}</p>
          ) : (
            <p className="analysis-card-empty">
              FinLen belum dapat menyusun ringkasan untuk dokumen ini.
            </p>
          )}
        </section>
      </Reveal>

      <Reveal index={2}>
        <FinancialTermsCard terms={analysis.financial_terms} />
      </Reveal>

      <Reveal index={3}>
        <RedFlagsCard redFlags={analysis.red_flags} />
      </Reveal>

      <Reveal index={4}>
        <RiskFactorsCard factors={analysis.risk_factors} />
      </Reveal>

      <Reveal index={5}>
        <RecommendedActionsCard actions={analysis.recommended_actions} />
      </Reveal>

      <Reveal index={6}>
        <FinancialLiteracyCard concepts={analysis.financial_literacy} />
      </Reveal>

      <Reveal index={7}>
        <section className="analysis-cta-card" aria-labelledby="analysis-cta-title">
          <div className="analysis-cta-copy">
            <h2 id="analysis-cta-title">Uji angkanya di simulator</h2>
            <p>
              {bridge.prefilled.length > 0
                ? `FinLen akan mengisi otomatis: ${bridge.prefilled.join(", ")}. Kamu tetap perlu mengatur ${bridge.missing.join(", ").toLowerCase()} sendiri.`
                : `Angka dari dokumen ini belum cukup untuk mengisi simulator otomatis. Kamu dapat mengatur ${bridge.missing.join(", ").toLowerCase()} secara manual.`}
            </p>
          </div>

          <div className="analysis-cta-bar">
            <Link
              href={bridge.href}
              className="button button-primary analysis-cta-primary"
            >
              <span>Simulasikan di Simulator</span>
              <span className="button-orb" aria-hidden="true">
                <ChartLineUp size={16} weight="bold" />
              </span>
            </Link>

            <button
              type="button"
              className="button button-secondary analysis-cta-secondary"
              onClick={onAnalyzeAnother}
            >
              <UploadSimple size={16} weight="bold" aria-hidden="true" />
              <span>Analisis dokumen lain</span>
            </button>
          </div>
        </section>
      </Reveal>

      <Reveal index={8}>
        <p className="analysis-disclaimer">
          <ArrowRight size={15} weight="bold" aria-hidden="true" />
          Analisis ini bersifat edukatif dan dibuat otomatis dari teks dokumen
          yang terbaca. Ini bukan nasihat keuangan atau hukum. Selalu periksa
          dokumen aslinya sebelum menandatangani atau membayar.
        </p>
      </Reveal>
    </div>
  );
}

export default AnalysisResult;
