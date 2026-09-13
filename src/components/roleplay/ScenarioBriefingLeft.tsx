"use client";

import type { ScenarioDetail } from "@/lib/types/roleplay";
import { CategoryBadge } from "./BadgeLabel";
import { LearningMaterialsList } from "./LearningMaterialsList";
import { ScenarioBackButton } from "./ScenarioBackButton";

interface ScenarioBriefingLeftProps {
  scenario: ScenarioDetail;
}

/**
 * Left column of the loaded Scenario_Detail_Page briefing: title,
 * description, category badge, learning materials, and the Back_Button.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.11, 3.12, 3.14
 */
export function ScenarioBriefingLeft({ scenario }: ScenarioBriefingLeftProps) {
  return (
    <div className="scenario-briefing-left">
      <ScenarioBackButton />
      <CategoryBadge category={scenario.category} />
      <h1 className="scenario-briefing-title">{scenario.title}</h1>
      <p className="scenario-briefing-description">{scenario.description}</p>
      <div className="financial-context-row scenario-briefing-objective-row">
        <span className="financial-context-row-label">Target Pembelajaran</span>
        <p className="financial-context-row-value">{scenario.objective}</p>
      </div>
      <section className="scenario-briefing-materials" aria-label="Materi Pendukung">
        <h2 className="scenario-briefing-materials-heading">Materi Pendukung</h2>
        <LearningMaterialsList items={scenario.learning_materials} />
      </section>
    </div>
  );
}
