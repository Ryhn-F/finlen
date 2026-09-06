"use client";

import { ArrowRight, ChatsTeardrop, ShieldCheck, WarningOctagon } from "@phosphor-icons/react";
import type { ScenarioListItem } from "@/lib/types/roleplay";

interface ScenarioCardProps {
  scenario: ScenarioListItem;
  onStart: (scenarioId: string) => void;
  isLoading?: boolean;
}

function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case "debt":
      return "category-debt";
    case "spending":
      return "category-spending";
    case "fraud":
      return "category-fraud";
    case "emergency":
      return "category-emergency";
    case "social":
      return "category-social";
    default:
      return "category-default";
  }
}

function getDifficultyLabel(diff: string): string {
  switch (diff.toLowerCase()) {
    case "easy":
      return "MUDAH";
    case "medium":
      return "MENENGAH";
    case "hard":
      return "SULIT";
    default:
      return diff.toUpperCase();
  }
}

export function ScenarioCard({ scenario, onStart, isLoading = false }: ScenarioCardProps) {
  const categoryClass = getCategoryColor(scenario.category);
  const difficultyLabel = getDifficultyLabel(scenario.difficulty);

  return (
    <article className={`scenario-card ${categoryClass}`}>
      <div className="scenario-card-header">
        <span className="scenario-badge">
          {scenario.category.toUpperCase()} · {difficultyLabel}
        </span>
        <span className="scenario-turns-badge" title="Jumlah giliran maksimum">
          {scenario.max_turns} Giliran
        </span>
      </div>

      <h3 className="scenario-card-title">{scenario.title}</h3>

      <p className="scenario-card-desc">{scenario.description}</p>

      <div className="scenario-npc-box">
        <div className="npc-avatar-badge" aria-hidden="true">
          {scenario.category.toLowerCase() === "fraud" ? (
            <WarningOctagon size={18} weight="duotone" />
          ) : scenario.category.toLowerCase() === "debt" ? (
            <ChatsTeardrop size={18} weight="duotone" />
          ) : (
            <ShieldCheck size={18} weight="duotone" />
          )}
        </div>
        <div className="npc-info">
          <span className="npc-role-tag">Lawan Bicara (NPC)</span>
          <strong className="npc-name">{scenario.npc_role}</strong>
        </div>
      </div>

      <div className="scenario-card-actions">
        <button
          type="button"
          className="button button-primary scenario-start-btn"
          onClick={() => onStart(scenario.id)}
          disabled={isLoading}
          aria-label={`Mulai roleplay skenario ${scenario.title}`}
        >
          <span>{isLoading ? "Memulai..." : "Mulai Roleplay"}</span>
          <span className="button-orb" aria-hidden="true">
            <ArrowRight size={16} weight="bold" />
          </span>
        </button>
      </div>
    </article>
  );
}
