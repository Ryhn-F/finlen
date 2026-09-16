"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Brain,
  CaretDown,
  CaretUp,
  Gauge,
  Lightning,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  TrendUp,
  type Icon,
} from "@phosphor-icons/react";
import type { SessionScores, SessionStateData } from "@/lib/types/roleplay";
import { useState } from "react";

interface RoleplayStatsProps {
  state: SessionStateData;
  scores: SessionScores;
  xpEarned: number;
}

interface StatMeterConfig {
  key: keyof SessionStateData;
  label: string;
  desc: string;
  icon: Icon;
  isNegativeTrait: boolean; // Higher pressure/risk is worse, higher trust/negotiation is better
}

const METERS: StatMeterConfig[] = [
  {
    key: "collector_pressure",
    label: "Tekanan Penagih",
    desc: "Intensitas desakan dan ancaman dari lawan bicara",
    icon: ShieldWarning,
    isNegativeTrait: true,
  },
  {
    key: "financial_risk",
    label: "Risiko Finansial",
    desc: "Potensi kerugian atau jeratan utang berbahaya",
    icon: Lightning,
    isNegativeTrait: true,
  },
  {
    key: "trust_level",
    label: "Tingkat Kepercayaan",
    desc: "Kredibilitas posisi tawar dan kejujuran interaksi",
    icon: ShieldCheck,
    isNegativeTrait: false,
  },
  {
    key: "negotiation_power",
    label: "Kekuatan Negosiasi",
    desc: "Kemampuanmu mengendalikan syarat penyelesaian",
    icon: TrendUp,
    isNegativeTrait: false,
  },
];

export function RoleplayStats({ state, scores, xpEarned }: RoleplayStatsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Meter color logic:
  // For negative traits (Pressure, Risk): low is good (green/neutral), high is severe (coral/red)
  // For positive traits (Trust, Power): low is warning, high is safe/positive
  function getMeterColorClass(value: number, isNegative: boolean): string {
    if (isNegative) {
      if (value >= 7) return "meter-danger";
      if (value >= 4) return "meter-warning";
      return "meter-safe";
    } else {
      if (value >= 7) return "meter-safe";
      if (value >= 4) return "meter-neutral";
      return "meter-warning";
    }
  }

  return (
    <aside className="roleplay-stats-panel" aria-label="Status Skenario & Naluri Finansial">
      {/* Mobile Toggle Bar */}
      <div
        className="stats-mobile-bar"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isMobileExpanded}
        aria-label="Buka ringkasan status skenario"
      >
        <div className="mobile-bar-summary">
          <span className="summary-instinct font-mono">
            Naluri: <strong>{scores.financial_instinct}</strong>/100
          </span>
          <span className="summary-pressure font-mono">
            Tekanan: {state.collector_pressure}/10
          </span>
          <span className="summary-risk font-mono">
            Risiko: {state.financial_risk}/10
          </span>
        </div>
        <button type="button" className="mobile-toggle-btn" aria-label="Toggle panel status">
          {isMobileExpanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
        </button>
      </div>

      <div className={`stats-panel-content ${isMobileExpanded ? "is-expanded" : ""}`}>
        {/* Header / XP */}
        <div className="stats-header">
          <div className="stats-title-block">
            <span className="stats-icon-wrap" aria-hidden="true">
              <Gauge size={20} weight="duotone" />
            </span>
            <div>
              <h3 className="stats-heading">Status Skenario</h3>
              <p className="stats-sub">Dinamika real-time interaksi</p>
            </div>
          </div>
          {xpEarned > 0 && (
            <div className="stats-xp-pill font-mono" title="Total XP yang terkumpul pada sesi ini">
              <Sparkle size={14} weight="fill" />
              <span>+{xpEarned} XP</span>
            </div>
          )}
        </div>

        {/* 4 Interactive State Meters */}
        <div className="runtime-meters-grid">
          {METERS.map((m) => {
            const rawVal = Number(state[m.key] ?? 0);
            const clampedVal = Math.min(Math.max(rawVal, 0), 10);
            const percentage = clampedVal * 10;
            const colorClass = getMeterColorClass(clampedVal, m.isNegativeTrait);
            const MeterIcon = m.icon;

            return (
              <div key={m.key} className="meter-card" title={m.desc}>
                <div className="meter-label-row">
                  <span className="meter-title">
                    <MeterIcon size={14} weight="bold" />
                    {m.label}
                  </span>
                  <span className="meter-value font-mono">
                    {clampedVal} <span className="meter-max">/ 10</span>
                  </span>
                </div>

                <div className="meter-track" role="progressbar" aria-valuenow={clampedVal} aria-valuemin={0} aria-valuemax={10}>
                  <motion.div
                    className={`meter-fill ${colorClass}`}
                    initial={false}
                    animate={{ width: `${percentage}%` }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 120, damping: 20 }
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Running Instinct Skill Breakdown */}
        <div className="running-instinct-box">
          <div className="instinct-box-header">
            <div>
              <span className="instinct-tag">Perkembangan Skor</span>
              <h4 className="instinct-title">Naluri Finansial</h4>
            </div>
            <div className="instinct-hero-score font-mono">
              <strong>{scores.financial_instinct}</strong>
              <small>/ 100</small>
            </div>
          </div>

          <div className="instinct-skills-list">
            <div className="instinct-skill-row">
              <span className="skill-name">
                <Brain size={13} weight="bold" /> Berpikir Kritis
              </span>
              <span className="skill-val font-mono">{scores.critical_thinking}</span>
            </div>
            <div className="instinct-skill-row">
              <span className="skill-name">
                <ShieldCheck size={13} weight="bold" /> Kesadaran Risiko
              </span>
              <span className="skill-val font-mono">{scores.risk_awareness}</span>
            </div>
            <div className="instinct-skill-row">
              <span className="skill-name">
                <Lightning size={13} weight="bold" /> Kontrol Impulsif
              </span>
              <span className="skill-val font-mono">{scores.impulse_control}</span>
            </div>
            <div className="instinct-skill-row">
              <span className="skill-name">
                <TrendUp size={13} weight="bold" /> Pengambilan Keputusan
              </span>
              <span className="skill-val font-mono">{scores.decision_making}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
