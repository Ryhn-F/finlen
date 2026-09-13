"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

/**
 * Navigation control that returns the player to the Roleplay_List_Page.
 * Self-contained: owns its own navigation so every Scenario_Detail_Page
 * state (loaded briefing, loading, error, not-found, invalid) can render
 * the same control without threading a callback through each branch.
 *
 * Requirements: 3.11, 3.12
 */
export function ScenarioBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="button button-secondary scenario-back-btn"
      onClick={() => router.push("/app/roleplay")}
    >
      <ArrowLeft size={16} weight="bold" />
      <span>Kembali ke Daftar Skenario</span>
    </button>
  );
}
