"use client";

import { useMemo, useState } from "react";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { ScenarioCard } from "./ScenarioCard";
import { ScenarioListSkeleton } from "./RoleplaySkeleton";
import { RoleplayError } from "./RoleplayError";
import { Funnel } from "@phosphor-icons/react";

interface ScenarioSelectorProps {
  onSelectScenario: (scenarioId: string) => void;
  startingScenarioId: string | null;
}

const CATEGORIES = [
  { id: "all", label: "Semua Skenario" },
  { id: "debt", label: "Utang & Pinjol" },
  { id: "spending", label: "Pengeluaran & Paylater" },
  { id: "fraud", label: "Penipuan Investasi" },
  { id: "emergency", label: "Dana Darurat" },
  { id: "social", label: "Tekanan Sosial" },
];

const DIFFICULTIES = [
  { id: "all", label: "Semua Tingkat" },
  { id: "easy", label: "Mudah" },
  { id: "medium", label: "Menengah" },
  { id: "hard", label: "Sulit" },
];

export function ScenarioSelector({
  onSelectScenario,
  startingScenarioId,
}: ScenarioSelectorProps) {
  const {
    data: scenarios,
    isLoading,
    isError,
    error,
    refetch,
  } = useScenarios();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredScenarios = useMemo(() => {
    if (!scenarios) return [];
    return scenarios.filter((s) => {
      const matchesCategory =
        selectedCategory === "all" ||
        s.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesDifficulty =
        selectedDifficulty === "all" ||
        s.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      return matchesCategory && matchesDifficulty;
    });
  }, [scenarios, selectedCategory, selectedDifficulty]);

  function handleResetFilters() {
    setSelectedCategory("all");
    setSelectedDifficulty("all");
  }

  return (
    <div className="scenario-selector-wrap">
      <header className="scenario-selector-hero">
        <span className="eyebrow">Simulasi Keputusan Nyata</span>
        <h1 className="scenario-selector-title">Bermain Peran Finansial</h1>
        <p className="scenario-selector-lead">
          Uji keputusanmu saat tekanan finansial terasa nyata. Hadapi situasi
          menegangkan, ambil tindakan terbaik, dan pelajari konsekuensi sebelum
          uangmu menjadi taruhan.
        </p>

        {/* Filters Row */}
        <div className="scenario-filter-row">
          <span className="filter-icon" aria-hidden="true">
            <Funnel size={18} weight="duotone" />
          </span>

          <div className="filter-select-wrap">
            <label htmlFor="filter-category" className="filter-select-label">
              Kategori
            </label>
            <select
              id="filter-category"
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <label htmlFor="filter-difficulty" className="filter-select-label">
              Kesulitan
            </label>
            <select
              id="filter-difficulty"
              className={`filter-select ${selectedDifficulty !== "all" ? `difficulty-${selectedDifficulty}` : ""}`}
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff.id} value={diff.id}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Loading state */}
      {isLoading && <ScenarioListSkeleton />}

      {/* Error state */}
      {isError && (
        <RoleplayError
          title="Tidak dapat memuat skenario"
          message={
            error instanceof Error
              ? error.message
              : "Kami belum bisa mengambil daftar skenario. Pastikan backend FinLen sedang berjalan."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredScenarios.length === 0 && (
        <div className="scenario-empty-state" role="status">
          <h3>Belum ada skenario yang cocok.</h3>
          <p>
            Tidak ditemukan skenario dengan filter yang dipilih. Coba ubah
            kategori atau tingkat kesulitan.
          </p>
          <button
            type="button"
            className="button button-secondary mt-4"
            onClick={handleResetFilters}
          >
            Tampilkan Semua Skenario
          </button>
        </div>
      )}

      {/* Scenarios Grid */}
      {!isLoading && !isError && filteredScenarios.length > 0 && (
        <div className="scenario-grid">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onStart={onSelectScenario}
              isLoading={startingScenarioId === scenario.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
