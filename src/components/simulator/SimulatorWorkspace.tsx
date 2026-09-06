"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChartLineUp,
  LockSimple,
  LockSimpleOpen,
  Repeat,
  SlidersHorizontal,
  WarningCircle,
} from "@phosphor-icons/react";
import { AppSidebar, AppTopbar, useSidebarState } from "@/components/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Scenario = {
  debt: number;
  rate: number;
  duration: number;
};

type ChartPoint = {
  month: number;
  amount?: number;
  optionA?: number;
  optionB?: number;
};

const DEFAULT_A: Scenario = { debt: 5_000_000, rate: 2, duration: 12 };
const DEFAULT_B: Scenario = { debt: 5_000_000, rate: 5, duration: 12 };

function calculateFinal({ debt, rate, duration }: Scenario) {
  return Math.floor(debt * (1 + rate / 100) ** duration);
}

function createSeries(scenario: Scenario): ChartPoint[] {
  return Array.from({ length: scenario.duration + 1 }, (_, month) => ({
    month,
    amount: Math.floor(scenario.debt * (1 + scenario.rate / 100) ** month),
  }));
}

function createComparisonSeries(
  optionA: Scenario,
  optionB: Scenario,
): ChartPoint[] {
  const months = Math.max(optionA.duration, optionB.duration);
  return Array.from({ length: months + 1 }, (_, month) => ({
    month,
    optionA:
      month <= optionA.duration
        ? Math.floor(optionA.debt * (1 + optionA.rate / 100) ** month)
        : undefined,
    optionB:
      month <= optionB.duration
        ? Math.floor(optionB.debt * (1 + optionB.rate / 100) ** month)
        : undefined,
  }));
}

function formatRupiah(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function formatCompactRupiah(value: number) {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  return formatRupiah(value);
}

function validateScenario(scenario: Scenario) {
  if (!Number.isFinite(scenario.debt) || scenario.debt < 100_000) {
    return "Masukkan utang awal minimal Rp 100.000.";
  }
  if (
    !Number.isFinite(scenario.rate) ||
    scenario.rate < 0 ||
    scenario.rate > 10
  ) {
    return "Bunga bulanan harus berada antara 0% dan 10%.";
  }
  if (
    !Number.isFinite(scenario.duration) ||
    scenario.duration < 1 ||
    scenario.duration > 60
  ) {
    return "Durasi harus berada antara 1 dan 60 bulan.";
  }
  return null;
}

function SliderField({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
  children,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  minLabel?: string;
  maxLabel?: string;
  onChange: (value: number) => void;
  children?: ReactNode;
}) {
  const displayMin =
    minLabel ??
    (min >= 1_000_000
      ? `Rp ${(min / 1_000_000).toLocaleString("id-ID")} jt`
      : min >= 1_000
        ? `Rp ${(min / 1_000).toLocaleString("id-ID")} rb`
        : `${min}`);
  const displayMax =
    maxLabel ??
    (max >= 1_000_000
      ? `Rp ${(max / 1_000_000).toLocaleString("id-ID")} jt`
      : max >= 1_000
        ? `Rp ${(max / 1_000).toLocaleString("id-ID")} rb`
        : `${max}`);

  return (
    <div className="sim-field">
      <div className="sim-field-label">
        <label htmlFor={`slider-${label.replaceAll(" ", "-").toLowerCase()}`}>
          {label}
        </label>
        <strong>{displayValue}</strong>
      </div>
      {children}
      <div className="slider-range-wrap">
        <input
          id={`slider-${label.replaceAll(" ", "-").toLowerCase()}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : min}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-describedby={`helper-${label.replaceAll(" ", "-").toLowerCase()}`}
        />
        <div className="slider-indicators" aria-hidden="true">
          <span className="slider-min">{displayMin}</span>
          <span className="slider-max">{displayMax}</span>
        </div>
      </div>
      <span
        id={`helper-${label.replaceAll(" ", "-").toLowerCase()}`}
        className="field-helper"
      >
        Geser untuk memperbarui grafik secara langsung.
      </span>
    </div>
  );
}

function InterestWarning({ rate }: { rate: number }) {
  if (rate < 5) return null;

  return (
    <div className="interest-warning" role="status">
      <WarningCircle size={19} weight="fill" />
      <span>
        <strong>Bunga tinggi</strong>
        Bunga {rate.toLocaleString("id-ID")}% per bulan dapat membuat utang
        tumbuh sangat cepat.
      </span>
    </div>
  );
}

function ComparisonRateControl({
  name,
  scenario,
  onChange,
}: {
  name: string;
  scenario: Scenario;
  onChange: (scenario: Scenario) => void;
}) {
  return (
    <section className="scenario-controls" aria-label={`Kontrol bunga ${name}`}>
      <div className="scenario-name">
        <span>{name}</span>
        <strong>{scenario.rate}% per bulan</strong>
      </div>
      <SliderField
        label={`Bunga ${name}`}
        value={scenario.rate}
        displayValue={`${scenario.rate.toLocaleString("id-ID")}%`}
        min={0}
        max={10}
        step={0.25}
        minLabel="0%"
        maxLabel="10%"
        onChange={(rate) => onChange({ ...scenario, rate })}
      />
      <InterestWarning rate={scenario.rate} />
    </section>
  );
}

function ChartSkeleton() {
  return (
    <div className="chart-skeleton" role="status" aria-live="polite">
      <span className="skeleton-line skeleton-line-top" />
      <span className="skeleton-line skeleton-line-mid" />
      <span className="skeleton-line skeleton-line-low" />
      <p>Menghitung hasil terbaru...</p>
    </div>
  );
}

export default function SimulatorWorkspace() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();
  const [comparisonMode, setComparisonMode] = useState(false);
  const [lockTerms, setLockTerms] = useState(true);
  const [activeComparisonTab, setActiveComparisonTab] = useState<"A" | "B">(
    "A",
  );
  const [optionA, setOptionA] = useState<Scenario>(DEFAULT_A);
  const [optionB, setOptionB] = useState<Scenario>(DEFAULT_B);
  const [displayA, setDisplayA] = useState<Scenario>(DEFAULT_A);
  const [displayB, setDisplayB] = useState<Scenario>(DEFAULT_B);
  const [calculating, setCalculating] = useState(false);

  const errorA = validateScenario(optionA);
  const errorB = comparisonMode ? validateScenario(optionB) : null;
  const error = errorA ?? errorB;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDisplayA(optionA);
      setDisplayB(optionB);
      setCalculating(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [optionA, optionB, comparisonMode, lockTerms]);

  function updateOptionA(scenario: Scenario) {
    setOptionA(scenario);
    if (comparisonMode && lockTerms) {
      setOptionB((prev) => ({
        ...prev,
        debt: scenario.debt,
        duration: scenario.duration,
      }));
    }
    setCalculating(true);
  }

  function updateOptionB(scenario: Scenario) {
    setOptionB(scenario);
    if (comparisonMode && lockTerms) {
      setOptionA((prev) => ({
        ...prev,
        debt: scenario.debt,
        duration: scenario.duration,
      }));
    }
    setCalculating(true);
  }

  function updateSharedDebt(debt: number) {
    setOptionA((prev) => ({ ...prev, debt }));
    setOptionB((prev) => ({ ...prev, debt }));
    setCalculating(true);
  }

  function updateSharedDuration(duration: number) {
    setOptionA((prev) => ({ ...prev, duration }));
    setOptionB((prev) => ({ ...prev, duration }));
    setCalculating(true);
  }

  function handleToggleLockTerms(locked: boolean) {
    setLockTerms(locked);
    if (locked) {
      setOptionB((prev) => ({
        ...prev,
        debt: optionA.debt,
        duration: optionA.duration,
      }));
    }
    setCalculating(true);
  }

  function updateComparisonMode(enabled: boolean) {
    if (enabled) {
      if (lockTerms) {
        setOptionB({
          ...optionB,
          debt: optionA.debt,
          duration: optionA.duration,
        });
      }
    }
    setComparisonMode(enabled);
    setCalculating(true);
  }

  const singleSeries = useMemo(() => createSeries(displayA), [displayA]);
  const comparisonSeries = useMemo(
    () => createComparisonSeries(displayA, displayB),
    [displayA, displayB],
  );
  const finalA = calculateFinal(displayA);
  const finalB = calculateFinal(displayB);
  const difference = Math.abs(finalB - finalA);
  const differenceRatio = difference / Math.max(Math.min(finalA, finalB), 1);

  function reset() {
    setOptionA(DEFAULT_A);
    setOptionB(DEFAULT_B);
    setDisplayA(DEFAULT_A);
    setDisplayB(DEFAULT_B);
    setComparisonMode(false);
    setLockTerms(true);
    setActiveComparisonTab("A");
  }

  return (
    <div className={`app-shell ${sidebarMinimized ? "is-minimized" : ""}`}>
      <AppSidebar
        isMinimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItemId="simulator"
      />

      <div className="app-main">
        <AppTopbar
          title="Lab Pertumbuhan Utang"
          subtitle="Visualisasi Data Interaktif"
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarOpen((prev) => !prev);
            } else {
              setSidebarMinimized((prev) => !prev);
            }
          }}
          actions={
            <button className="reset-button" onClick={reset}>
              <Repeat size={18} weight="bold" />
              Atur Ulang
            </button>
          }
        />

        <main className="simulator-main" id="simulator">
          <section className="simulator-intro">
            <div>
              <h1>Lihat bagaimana waktu mengubah utang.</h1>
              <p>
                Ubah nilainya. Grafik diperbarui langsung agar bunga majemuk
                terlihat nyata dan mudah dipahami.
              </p>
            </div>
            <label className="compare-switch">
              <span>
                <strong>Mode perbandingan</strong>
                <small>Bandingkan dua penawaran dalam satu grafik</small>
              </span>
              <input
                type="checkbox"
                checked={comparisonMode}
                onChange={(event) => updateComparisonMode(event.target.checked)}
              />
              <span className="switch-track" aria-hidden="true">
                <span />
              </span>
            </label>
          </section>

          <div
            className={`simulator-grid ${comparisonMode ? "is-comparison" : ""}`}
          >
            <section className="controls-panel" aria-labelledby="inputs-title">
              <div className="panel-heading">
                <span className="panel-icon">
                  <SlidersHorizontal size={24} weight="duotone" />
                </span>
                <div>
                  <h2 id="inputs-title">Atur skenarionya</h2>
                  <p>Perubahan dihitung secara otomatis.</p>
                </div>
              </div>

              {comparisonMode ? (
                <div className="comparison-controls">
                  <div className="comparison-lock-banner">
                    <div className="lock-banner-info">
                      <span className="lock-badge">
                        {lockTerms ? (
                          <LockSimple size={20} weight="bold" />
                        ) : (
                          <LockSimpleOpen size={20} weight="bold" />
                        )}
                      </span>
                      <div>
                        <strong>
                          {lockTerms
                            ? "Utang awal & durasi terkunci sama"
                            : "Pengaturan mandiri Opsi A & B"}
                        </strong>
                        <p>
                          {lockTerms
                            ? "Utang awal dan durasi disinkronkan agar fokus menguji perbedaan bunga."
                            : "Utang awal, bunga, dan durasi tiap opsi dapat diatur bebas."}
                        </p>
                      </div>
                    </div>

                    <label
                      className="lock-toggle-switch"
                      title={
                        lockTerms
                          ? "Buka kunci untuk mengatur utang & durasi secara mandiri"
                          : "Kunci untuk menyamakan utang & durasi"
                      }
                    >
                      <span className="lock-toggle-label">
                        {lockTerms ? "Terkunci" : "Bebas"}
                      </span>
                      <input
                        type="checkbox"
                        checked={lockTerms}
                        onChange={(e) =>
                          handleToggleLockTerms(e.target.checked)
                        }
                      />
                      <span className="switch-track" aria-hidden="true">
                        <span />
                      </span>
                    </label>
                  </div>

                  {lockTerms ? (
                    <div className="comparison-locked-layout">
                      <div className="shared-terms-card">
                        <div className="shared-terms-header">
                          <span className="shared-badge">
                            Ketentuan Bersama
                          </span>
                          <small>Berlaku untuk Opsi A & B</small>
                        </div>

                        <SliderField
                          label="Utang awal bersama"
                          value={optionA.debt}
                          displayValue={formatRupiah(optionA.debt)}
                          min={100_000}
                          max={50_000_000}
                          step={100_000}
                          minLabel="Rp 100 rb"
                          maxLabel="Rp 50 jt"
                          onChange={updateSharedDebt}
                        >
                          <div className="currency-entry">
                            <span className="currency-prefix">Rp</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={
                                optionA.debt
                                  ? optionA.debt.toLocaleString("id-ID")
                                  : ""
                              }
                              placeholder="5.000.000"
                              onChange={(event) => {
                                const rawDigits = event.target.value.replace(
                                  /\D/g,
                                  "",
                                );
                                const num =
                                  rawDigits === "" ? 0 : Number(rawDigits);
                                updateSharedDebt(Math.min(num, 50_000_000));
                              }}
                              aria-label="Masukan angka utang awal bersama"
                            />
                            <span className="currency-suffix">,-</span>
                          </div>
                        </SliderField>

                        <SliderField
                          label="Durasi bersama"
                          value={optionA.duration}
                          displayValue={`${optionA.duration} bulan`}
                          min={1}
                          max={60}
                          step={1}
                          minLabel="1 bln"
                          maxLabel="60 bln"
                          onChange={updateSharedDuration}
                        />
                      </div>

                      <div className="comparison-rate-grid">
                        <ComparisonRateControl
                          name="Opsi A"
                          scenario={optionA}
                          onChange={updateOptionA}
                        />
                        <ComparisonRateControl
                          name="Opsi B"
                          scenario={optionB}
                          onChange={updateOptionB}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="comparison-unlocked-layout">
                      <div className="comparison-tab-header">
                        <button
                          type="button"
                          className={`comparison-tab-btn option-a-tab ${activeComparisonTab === "A" ? "is-active" : ""}`}
                          onClick={() => setActiveComparisonTab("A")}
                        >
                          <div>
                            <span className="tab-pill tab-pill-a" />
                            <span>Opsi A</span>
                          </div>
                          <small>
                            {formatCompactRupiah(optionA.debt)} • {optionA.rate}
                            % • {optionA.duration} bln
                          </small>
                        </button>
                        <button
                          type="button"
                          className={`comparison-tab-btn option-b-tab ${activeComparisonTab === "B" ? "is-active" : ""}`}
                          onClick={() => setActiveComparisonTab("B")}
                        >
                          <div>
                            <span className="tab-pill tab-pill-b" />
                            <span>Opsi B</span>
                          </div>
                          <small>
                            {formatCompactRupiah(optionB.debt)} • {optionB.rate}
                            % • {optionB.duration} bln
                          </small>
                        </button>
                      </div>

                      {activeComparisonTab === "A" ? (
                        <div className="option-full-card option-a-card">
                          <div className="option-card-title">
                            <span className="tab-pill tab-pill-a" />
                            <span>Pengaturan Opsi A</span>
                          </div>
                          <SliderField
                            label="Utang awal Opsi A"
                            value={optionA.debt}
                            displayValue={formatRupiah(optionA.debt)}
                            min={100_000}
                            max={50_000_000}
                            step={100_000}
                            minLabel="Rp 100 rb"
                            maxLabel="Rp 50 jt"
                            onChange={(debt) =>
                              updateOptionA({ ...optionA, debt })
                            }
                          >
                            <div className="currency-entry">
                              <span className="currency-prefix">Rp</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={
                                  optionA.debt
                                    ? optionA.debt.toLocaleString("id-ID")
                                    : ""
                                }
                                placeholder="5.000.000"
                                onChange={(event) => {
                                  const rawDigits = event.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  const num =
                                    rawDigits === "" ? 0 : Number(rawDigits);
                                  updateOptionA({
                                    ...optionA,
                                    debt: Math.min(num, 50_000_000),
                                  });
                                }}
                                aria-label="Masukan angka utang awal Opsi A"
                              />
                              <span className="currency-suffix">,-</span>
                            </div>
                          </SliderField>

                          <SliderField
                            label="Bunga bulanan Opsi A"
                            value={optionA.rate}
                            displayValue={`${optionA.rate.toLocaleString("id-ID")}%`}
                            min={0}
                            max={10}
                            step={0.25}
                            minLabel="0%"
                            maxLabel="10%"
                            onChange={(rate) =>
                              updateOptionA({ ...optionA, rate })
                            }
                          />
                          <InterestWarning rate={optionA.rate} />

                          <SliderField
                            label="Durasi Opsi A"
                            value={optionA.duration}
                            displayValue={`${optionA.duration} bulan`}
                            min={1}
                            max={60}
                            step={1}
                            minLabel="1 bln"
                            maxLabel="60 bln"
                            onChange={(duration) =>
                              updateOptionA({ ...optionA, duration })
                            }
                          />
                        </div>
                      ) : (
                        <div className="option-full-card option-b-card">
                          <div className="option-card-title">
                            <span className="tab-pill tab-pill-b" />
                            <span>Pengaturan Opsi B</span>
                          </div>
                          <SliderField
                            label="Utang awal Opsi B"
                            value={optionB.debt}
                            displayValue={formatRupiah(optionB.debt)}
                            min={100_000}
                            max={50_000_000}
                            step={100_000}
                            minLabel="Rp 100 rb"
                            maxLabel="Rp 50 jt"
                            onChange={(debt) =>
                              updateOptionB({ ...optionB, debt })
                            }
                          >
                            <div className="currency-entry">
                              <span className="currency-prefix">Rp</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={
                                  optionB.debt
                                    ? optionB.debt.toLocaleString("id-ID")
                                    : ""
                                }
                                placeholder="5.000.000"
                                onChange={(event) => {
                                  const rawDigits = event.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  const num =
                                    rawDigits === "" ? 0 : Number(rawDigits);
                                  updateOptionB({
                                    ...optionB,
                                    debt: Math.min(num, 50_000_000),
                                  });
                                }}
                                aria-label="Masukan angka utang awal Opsi B"
                              />
                              <span className="currency-suffix">,-</span>
                            </div>
                          </SliderField>

                          <SliderField
                            label="Bunga bulanan Opsi B"
                            value={optionB.rate}
                            displayValue={`${optionB.rate.toLocaleString("id-ID")}%`}
                            min={0}
                            max={10}
                            step={0.25}
                            minLabel="0%"
                            maxLabel="10%"
                            onChange={(rate) =>
                              updateOptionB({ ...optionB, rate })
                            }
                          />
                          <InterestWarning rate={optionB.rate} />

                          <SliderField
                            label="Durasi Opsi B"
                            value={optionB.duration}
                            displayValue={`${optionB.duration} bulan`}
                            min={1}
                            max={60}
                            step={1}
                            minLabel="1 bln"
                            maxLabel="60 bln"
                            onChange={(duration) =>
                              updateOptionB({ ...optionB, duration })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="single-controls">
                  <SliderField
                    label="Utang awal"
                    value={optionA.debt}
                    displayValue={formatRupiah(optionA.debt)}
                    min={100_000}
                    max={50_000_000}
                    step={100_000}
                    minLabel="Rp 100 rb"
                    maxLabel="Rp 50 jt"
                    onChange={(debt) => updateOptionA({ ...optionA, debt })}
                  >
                    <div className="currency-entry">
                      <span className="currency-prefix">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          optionA.debt
                            ? optionA.debt.toLocaleString("id-ID")
                            : ""
                        }
                        placeholder="5.000.000"
                        onChange={(event) => {
                          const rawDigits = event.target.value.replace(
                            /\D/g,
                            "",
                          );
                          const num = rawDigits === "" ? 0 : Number(rawDigits);
                          updateOptionA({
                            ...optionA,
                            debt: Math.min(num, 50_000_000),
                          });
                        }}
                        aria-label="Masukan angka utang awal"
                      />
                      <span className="currency-suffix">,-</span>
                    </div>
                  </SliderField>
                  <SliderField
                    label="Bunga bulanan"
                    value={optionA.rate}
                    displayValue={`${optionA.rate.toLocaleString("id-ID")}%`}
                    min={0}
                    max={10}
                    step={0.25}
                    minLabel="0%"
                    maxLabel="10%"
                    onChange={(rate) => updateOptionA({ ...optionA, rate })}
                  />
                  <InterestWarning rate={optionA.rate} />
                  <SliderField
                    label="Durasi"
                    value={optionA.duration}
                    displayValue={`${optionA.duration} bulan`}
                    min={1}
                    max={60}
                    step={1}
                    minLabel="1 bln"
                    maxLabel="60 bln"
                    onChange={(duration) =>
                      updateOptionA({ ...optionA, duration })
                    }
                  />
                </div>
              )}

              {error ? (
                <div className="inline-error" role="alert">
                  <WarningCircle size={20} weight="fill" />
                  {error}
                </div>
              ) : null}
            </section>

            <section className="chart-panel" aria-labelledby="chart-title">
              <div className="chart-heading">
                <div>
                  <h2 id="chart-title">Pertumbuhan utang</h2>
                  <p>
                    {comparisonMode
                      ? "Opsi A dan Opsi B"
                      : `Proyeksi ${displayA.duration} bulan`}
                  </p>
                </div>
                <span className="chart-status">Perhitungan langsung</span>
              </div>

              {error ? (
                <div className="chart-error" role="alert">
                  <WarningCircle size={34} weight="duotone" />
                  <h3>Grafik memerlukan skenario yang valid.</h3>
                  <p>{error}</p>
                </div>
              ) : calculating ? (
                <ChartSkeleton />
              ) : (
                <div
                  className="chart-wrap"
                  role="img"
                  aria-label={
                    comparisonMode
                      ? "Grafik garis yang membandingkan pertumbuhan utang Opsi A dan Opsi B"
                      : "Grafik garis yang menampilkan pertumbuhan utang dari waktu ke waktu"
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {comparisonMode ? (
                      <LineChart
                        data={comparisonSeries}
                        margin={{ top: 12, right: 16, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid
                          stroke="#d8dce5"
                          strokeDasharray="4 7"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#687084", fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={formatCompactRupiah}
                          tickLine={false}
                          axisLine={false}
                          width={82}
                          tick={{ fill: "#687084", fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => formatRupiah(Number(value))}
                          labelFormatter={(month) => `Bulan ${month}`}
                          contentStyle={{
                            borderRadius: 14,
                            border: "1px solid #d8dce5",
                            boxShadow: "0 12px 30px rgba(23, 34, 56, 0.08)",
                          }}
                        />
                        <Legend iconType="plainline" />
                        <Line
                          type="monotone"
                          dataKey="optionA"
                          name="Opsi A"
                          stroke="#ff5f57"
                          strokeWidth={4}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="optionB"
                          name="Opsi B"
                          stroke="#24324a"
                          strokeWidth={4}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <LineChart
                        data={singleSeries}
                        margin={{ top: 12, right: 16, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid
                          stroke="#d8dce5"
                          strokeDasharray="4 7"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#687084", fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={formatCompactRupiah}
                          tickLine={false}
                          axisLine={false}
                          width={82}
                          tick={{ fill: "#687084", fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => formatRupiah(Number(value))}
                          labelFormatter={(month) => `Bulan ${month}`}
                          contentStyle={{
                            borderRadius: 14,
                            border: "1px solid #d8dce5",
                            boxShadow: "0 12px 30px rgba(23, 34, 56, 0.08)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name="Total utang"
                          stroke="#ff5f57"
                          strokeWidth={4}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          {!comparisonMode ? (
            <section
              className="summary-strip"
              aria-label="Ringkasan perhitungan"
            >
              <div>
                <span>Utang awal</span>
                <strong>{formatRupiah(displayA.debt)}</strong>
              </div>
              <div>
                <span>Bunga yang bertambah</span>
                <strong>{formatRupiah(finalA - displayA.debt)}</strong>
              </div>
              <div className="summary-final">
                <span>Jumlah akhir</span>
                <strong>{formatRupiah(finalA)}</strong>
              </div>
              <div
                className="summary-character"
                aria-label="Slot ilustrasi reaksi pemandu"
              >
                <ChartLineUp size={34} weight="duotone" />
                <p>
                  <strong>Waktu mengubah hasilnya.</strong> Bandingkan jumlah
                  akhir, bukan hanya bunga bulanan.
                </p>
              </div>
            </section>
          ) : (
            <section
              className={`comparison-summary ${differenceRatio > 0.5 ? "high-difference" : ""}`}
              aria-label="Ringkasan perbandingan skenario"
            >
              <div>
                <span>Jumlah akhir Opsi A</span>
                <strong
                  className={
                    finalA < finalB
                      ? "text-emerald-600"
                      : finalA > finalB
                        ? "text-red-500"
                        : ""
                  }
                >
                  {formatRupiah(finalA)}
                </strong>
                <small>
                  {displayA.debt !== displayB.debt
                    ? `${formatCompactRupiah(displayA.debt)} • ${displayA.rate}% • ${displayA.duration} bln`
                    : `${displayA.rate}% selama ${displayA.duration} bulan`}
                </small>
              </div>
              <div className="difference-callout bg-ink! !text-amber-400">
                <span className="!text-white">Selisih akhir</span>
                <strong>{formatRupiah(difference)}</strong>
                <small className="!text-white">
                  {finalB >= finalA
                    ? "Biaya Opsi B lebih besar"
                    : "Biaya Opsi A lebih besar"}
                </small>
              </div>
              <div>
                <span>Jumlah akhir Opsi B</span>
                <strong
                  className={
                    finalB < finalA
                      ? "text-emerald-600"
                      : finalB > finalA
                        ? "text-red-500"
                        : ""
                  }
                >
                  {formatRupiah(finalB)}
                </strong>
                <small>
                  {displayA.debt !== displayB.debt
                    ? `${formatCompactRupiah(displayB.debt)} • ${displayB.rate}% • ${displayB.duration} bln`
                    : `${displayB.rate}% selama ${displayB.duration} bulan`}
                </small>
              </div>
            </section>
          )}

          <p className="simulator-safety">
            Ini adalah simulasi edukatif, bukan nasihat keuangan, hukum, atau
            investasi. Hasil menggunakan asumsi bunga majemuk bulanan tanpa
            pembayaran cicilan atau biaya tambahan.
          </p>
        </main>
      </div>
    </div>
  );
}
