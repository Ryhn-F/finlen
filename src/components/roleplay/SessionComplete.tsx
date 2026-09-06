"use client";

import {
  ArrowRight,
  Brain,
  ChatsTeardrop,
  CheckCircle,
  Lightning,
  ShieldCheck,
  Sparkle,
  TrendUp,
} from "@phosphor-icons/react";
import type { SessionScores, UserProgressionUpdate } from "@/lib/types/roleplay";

interface SessionCompleteProps {
  scenarioTitle: string;
  scores: SessionScores;
  xpEarned: number;
  progression?: UserProgressionUpdate | null;
  onReviewTranscript: () => void;
  onChooseAnother: () => void;
}

export function SessionComplete({
  scenarioTitle,
  scores,
  xpEarned,
  progression,
  onReviewTranscript,
  onChooseAnother,
}: SessionCompleteProps) {
  const finalInstinct = scores.financial_instinct;

  function getPerformanceNarrative(score: number): {
    headline: string;
    summary: string;
  } {
    if (score >= 80) {
      return {
        headline: "Naluri Finansial Sangat Tajam!",
        summary:
          "Kamu menunjukkan ketenangan luar biasa di bawah tekanan. Keputusanmu selalu mengutamakan verifikasi hak, menolak intimidasi, dan menjaga stabilitas keuangan jangka panjang.",
      };
    }
    if (score >= 65) {
      return {
        headline: "Kesadaran Risiko yang Baik",
        summary:
          "Kamu mampu mengidentifikasi bahaya utama dan melindungi diri dari keputusan impulsif, meskipun ada momen di mana desakan lawan bicara sempat menaikkan tekananmu.",
      };
    }
    return {
      headline: "Pelajaran Berharga Terbuka",
      summary:
        "Skenario ini membuktikan bagaimana tekanan psikologis dapat memicu keputusan terburu-buru. Jadikan ini latihan aman agar tidak mengulanginya saat uang sungguhan menjadi taruhan.",
    };
  }

  const narrative = getPerformanceNarrative(finalInstinct);

  const skillCards = [
    {
      key: "critical_thinking",
      label: "Berpikir Kritis",
      value: scores.critical_thinking,
      icon: Brain,
      desc: "Kemampuan memverifikasi klaim dan meminta bukti hukum",
    },
    {
      key: "risk_awareness",
      label: "Kesadaran Risiko",
      value: scores.risk_awareness,
      icon: ShieldCheck,
      desc: "Kepekaan terhadap biaya tersembunyi dan ancaman ilegal",
    },
    {
      key: "impulse_control",
      label: "Kontrol Impulsif",
      value: scores.impulse_control,
      icon: Lightning,
      desc: "Menahan diri dari komitmen pembayaran panik",
    },
    {
      key: "decision_making",
      label: "Pengambilan Keputusan",
      value: scores.decision_making,
      icon: TrendUp,
      desc: "Menawarkan alternatif realistis sesuai kemampuan kas",
    },
  ];

  return (
    <div className="session-complete-wrap" role="region" aria-label="Hasil Roleplay Finansial">
      <div className="session-complete-card">
        <header className="complete-card-head">
          <div className="complete-badge">
            <CheckCircle size={16} weight="fill" />
            <span>Roleplay Diselesaikan</span>
          </div>
          <h2 className="complete-title">{scenarioTitle}</h2>
          <p className="complete-sub">Evaluasi akhir ketahanan dan kecerdasan keputusanmu</p>
        </header>

        {/* Hero Score Showcase */}
        <div className="complete-score-showcase">
          <div className="score-main-pillar">
            <span className="score-pillar-label">Skor Naluri Finansial</span>
            <div className="score-giant-number font-mono">
              <strong>{finalInstinct}</strong>
              <small>/ 100</small>
            </div>
            <p className="score-headline">{narrative.headline}</p>
            <p className="score-summary">{narrative.summary}</p>
          </div>

          <div className="score-xp-pillar">
            <div className="xp-giant-badge font-mono">
              <Sparkle size={20} weight="fill" />
              <span>+{xpEarned} XP</span>
            </div>
            <p className="xp-note">Diberikan ke akunmu atas penyelesaian skenario ini.</p>

            {progression && (
              <div className="user-progression-box">
                <span className="progression-label">Status Profil FinLen:</span>
                <div className="progression-level font-mono">
                  Level {progression.level} · Total {progression.xp} XP
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4 Skill Score Cards */}
        <div className="complete-skills-grid">
          {skillCards.map((skill) => {
            const SkillIcon = skill.icon;
            return (
              <div key={skill.key} className="skill-meter-card">
                <div className="skill-head">
                  <span className="skill-icon-pill" aria-hidden="true">
                    <SkillIcon size={16} weight="bold" />
                  </span>
                  <strong className="skill-score font-mono">{skill.value}</strong>
                </div>
                <h4 className="skill-title">{skill.label}</h4>
                <p className="skill-desc">{skill.desc}</p>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill" style={{ width: `${skill.value}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <footer className="complete-actions-bar">
          <button
            type="button"
            className="button button-secondary"
            onClick={onReviewTranscript}
          >
            <ChatsTeardrop size={18} weight="bold" />
            <span>Tinjau Percakapan</span>
          </button>

          <button
            type="button"
            className="button button-primary"
            onClick={onChooseAnother}
          >
            <span>Coba Skenario Lain</span>
            <span className="button-orb" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
