"use client";

import {
  Brain,
  CheckCircle,
  Lightning,
  ShieldCheck,
  TrendDown,
  TrendUp,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import type { TurnEvaluation } from "@/lib/types/roleplay";

interface DecisionEvaluationProps {
  evaluation: TurnEvaluation;
}

function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function getDeltaClass(value: number): string {
  if (value > 0) return "delta-positive";
  if (value < 0) return "delta-negative";
  return "delta-neutral";
}

function getSeverityBadge(severity: string) {
  switch (severity.toLowerCase()) {
    case "positive":
      return {
        label: "Dampak Positif",
        icon: CheckCircle,
        className: "severity-positive",
      };
    case "neutral":
      return {
        label: "Dampak Netral",
        icon: ShieldCheck,
        className: "severity-neutral",
      };
    case "critical":
      return {
        label: "Risiko Kritis",
        icon: XCircle,
        className: "severity-critical",
      };
    case "negative":
    default:
      return {
        label: "Risiko Meningkat",
        icon: WarningCircle,
        className: "severity-negative",
      };
  }
}

export function DecisionEvaluation({ evaluation }: DecisionEvaluationProps) {
  const { scores, consequence, feedback } = evaluation;
  const severity = getSeverityBadge(consequence.severity);
  const SeverityIcon = severity.icon;

  const scoreItems = [
    {
      key: "critical_thinking",
      label: "Berpikir Kritis",
      value: scores.critical_thinking,
      icon: Brain,
    },
    {
      key: "risk_awareness",
      label: "Kesadaran Risiko",
      value: scores.risk_awareness,
      icon: ShieldCheck,
    },
    {
      key: "impulse_control",
      label: "Kontrol Impulsif",
      value: scores.impulse_control,
      icon: Lightning,
    },
    {
      key: "decision_making",
      label: "Pengambilan Keputusan",
      value: scores.decision_making,
      icon: TrendUp,
    },
  ];

  return (
    <div className="decision-evaluation-card" aria-label="Evaluasi Keputusan">
      <div className="evaluation-card-header">
        <div className="evaluation-title-wrap">
          <span className="evaluation-badge">Evaluasi AI</span>
          <strong className="evaluation-title">Dampak Keputusanmu</strong>
        </div>
        <div className={`consequence-severity-pill ${severity.className}`}>
          <SeverityIcon size={14} weight="bold" />
          <span>{severity.label}</span>
        </div>
      </div>

      {/* Skill Score Deltas */}
      <div className="evaluation-scores-grid">
        {scoreItems.map((item) => (
          <div key={item.key} className="score-delta-item">
            <span className="score-delta-label">{item.label}</span>
            <span className={`score-delta-val font-mono ${getDeltaClass(item.value)}`}>
              {item.value > 0 ? (
                <TrendUp size={14} weight="bold" />
              ) : item.value < 0 ? (
                <TrendDown size={14} weight="bold" />
              ) : null}
              {formatDelta(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Consequence Description */}
      {consequence.description && (
        <div className="consequence-narrative-box">
          <span className="consequence-label">Konsekuensi Langsung:</span>
          <p className="consequence-text">{consequence.description}</p>
        </div>
      )}

      {/* Educational Feedback */}
      {feedback && (
        <div className="evaluation-feedback-box">
          <p className="feedback-text">{feedback}</p>
        </div>
      )}
    </div>
  );
}
