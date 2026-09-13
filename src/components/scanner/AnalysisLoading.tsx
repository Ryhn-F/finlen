"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle, FileMagnifyingGlass } from "@phosphor-icons/react";

export interface AnalysisLoadingProps {
  fileName: string;
  fileMeta: string;
}

/**
 * Presentation stages only. The analyzer endpoint is a single request/response
 * call, so no real backend progress is claimed and no fake percentage is shown.
 */
const STAGES = [
  {
    title: "Membaca dokumenmu",
    description: "FinLen sedang mencari informasi penting di dalam dokumen ini.",
  },
  {
    title: "Memahami ketentuan",
    description:
      "Kami sedang mengubah istilah finansial menjadi informasi yang lebih mudah dipahami.",
  },
  {
    title: "Mendeteksi risiko",
    description: "FinLen sedang mencari hal-hal yang perlu kamu perhatikan.",
  },
  {
    title: "Menyiapkan insight",
    description:
      "Sedikit lagi. FinLen sedang merangkum pelajaran dari dokumen ini.",
  },
] as const;

const STAGE_DURATION = 3200;

export function AnalysisLoading({ fileName, fileMeta }: AnalysisLoadingProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) return;

    const timer = window.setTimeout(() => {
      setStageIndex((current) => Math.min(current + 1, STAGES.length - 1));
    }, STAGE_DURATION);

    return () => window.clearTimeout(timer);
  }, [stageIndex]);

  const stage = STAGES[stageIndex];

  return (
    <section
      className="analysis-loading-card"
      aria-label="Proses analisis dokumen"
    >
      <div className="analysis-loading-doc">
        <span className="analysis-loading-orb" aria-hidden="true">
          <motion.span
            className="analysis-loading-orb-ring"
            animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 2.4, repeat: Infinity, ease: "linear" }
            }
          />
          <FileMagnifyingGlass size={26} weight="duotone" />
        </span>
        <div className="analysis-loading-doc-meta">
          <strong title={fileName}>{fileName}</strong>
          <span>{fileMeta}</span>
        </div>
      </div>

      <div className="analysis-loading-stage" role="status" aria-live="polite">
        <h1>{stage.title}</h1>
        <p>{stage.description}</p>
      </div>

      <ol className="analysis-loading-steps">
        {STAGES.map((item, index) => {
          const isDone = index < stageIndex;
          const isActive = index === stageIndex;
          return (
            <li
              key={item.title}
              className={`analysis-loading-step ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}
            >
              <span className="analysis-step-marker" aria-hidden="true">
                {isDone ? <CheckCircle size={16} weight="fill" /> : null}
              </span>
              <span className="analysis-step-label">{item.title}</span>
            </li>
          );
        })}
      </ol>

      <p className="analysis-loading-note">
        Tahapan di atas menggambarkan alur pembacaan dokumen, bukan progres
        langsung dari server. Dokumen yang lebih panjang butuh waktu lebih lama.
      </p>
    </section>
  );
}

export default AnalysisLoading;
