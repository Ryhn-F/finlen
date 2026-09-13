/**
 * Presentation helpers for the Smart Document Analyzer.
 * Backend values are never mutated — they are only localized for display.
 */
import type {
  FinancialTerms,
  RiskLevel,
  RiskSeverity,
} from "../types/analyzer";

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "Risiko Rendah",
  medium: "Risiko Sedang",
  high: "Risiko Tinggi",
  critical: "Risiko Kritis",
  unknown: "Risiko Belum Diketahui",
};

export const RISK_SEVERITY_LABELS: Record<RiskSeverity, string> = {
  low: "Risiko Rendah",
  medium: "Risiko Sedang",
  high: "Risiko Tinggi",
  critical: "Risiko Kritis",
};

/** Short, non-alarmist framing shown under the risk badge. */
export const RISK_LEVEL_DESCRIPTIONS: Record<RiskLevel, string> = {
  low: "Ketentuan pada dokumen ini tergolong wajar, tetapi tetap periksa detailnya.",
  medium: "Ada beberapa ketentuan yang sebaiknya kamu periksa lebih teliti.",
  high: "Beberapa ketentuan berpotensi memberatkan. Pahami dulu sebelum menyetujui.",
  critical:
    "Ada ketentuan yang sangat perlu diperiksa sebelum kamu mengambil keputusan.",
  unknown:
    "FinLen belum dapat menyimpulkan tingkat risiko dari dokumen ini secara pasti.",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  loan_agreement: "Perjanjian Pinjaman",
  paylater_statement: "Tagihan PayLater",
  credit_card_statement: "Tagihan Kartu Kredit",
  bank_statement: "Rekening Koran",
  invoice: "Tagihan",
  receipt: "Bukti Pembayaran",
  insurance_policy: "Polis Asuransi",
  investment_offer: "Penawaran Investasi",
  employment_contract: "Kontrak Kerja",
  rental_agreement: "Perjanjian Sewa",
  unknown: "Dokumen Finansial",
};

/**
 * `loan_agreement` -> `Perjanjian Pinjaman`.
 * Unknown backend classifications degrade to a readable Title Case label.
 */
export function humanizeDocumentType(value: string): string {
  const key = value.trim().toLowerCase();
  if (!key) return "Dokumen Finansial";
  if (DOCUMENT_TYPE_LABELS[key]) return DOCUMENT_TYPE_LABELS[key];

  return key
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const MONTHLY_PERIODS = ["monthly", "month", "per month", "bulanan", "bulan", "per bulan"];
const YEARLY_PERIODS = ["yearly", "annual", "annually", "year", "per year", "tahunan", "tahun", "per tahun"];
const WEEKLY_PERIODS = ["weekly", "week", "per week", "mingguan", "minggu", "per minggu"];
const DAILY_PERIODS = ["daily", "day", "per day", "harian", "hari", "per hari"];

function normalizePeriod(period: string): string {
  return period.trim().toLowerCase();
}

export function isMonthlyPeriod(period: string | null): boolean {
  if (!period) return false;
  return MONTHLY_PERIODS.includes(normalizePeriod(period));
}

/** `monthly` -> `bulan` (used as `5% / bulan`). */
export function humanizeInterestPeriod(period: string): string {
  const normalized = normalizePeriod(period);
  if (MONTHLY_PERIODS.includes(normalized)) return "bulan";
  if (YEARLY_PERIODS.includes(normalized)) return "tahun";
  if (WEEKLY_PERIODS.includes(normalized)) return "minggu";
  if (DAILY_PERIODS.includes(normalized)) return "hari";
  return period.trim();
}

/**
 * Bounds accepted by the existing debt growth simulator
 * (see src/components/simulator/SimulatorWorkspace.tsx).
 */
export const SIMULATOR_LIMITS = {
  minDebt: 100_000,
  maxDebt: 50_000_000,
  minRate: 0,
  maxRate: 10,
} as const;

export interface SimulatorBridge {
  href: string;
  /** Values that will be prefilled, already localized. */
  prefilled: string[];
  /** Values the user still has to set inside the simulator. */
  missing: string[];
}

/**
 * Builds the `/app/simulator` link from detected terms.
 *
 * Only values the analyzer actually returned — and that fit the simulator's
 * supported ranges — are forwarded. Duration is never guessed because the
 * analyzer endpoint does not return it.
 */
export function buildSimulatorBridge(terms: FinancialTerms): SimulatorBridge {
  const params = new URLSearchParams();
  const prefilled: string[] = [];
  const missing: string[] = [];

  const currency = (terms.currency || "IDR").toUpperCase();
  const principal = terms.principal;

  if (
    currency === "IDR" &&
    typeof principal === "number" &&
    Number.isFinite(principal) &&
    principal >= SIMULATOR_LIMITS.minDebt &&
    principal <= SIMULATOR_LIMITS.maxDebt
  ) {
    params.set("debt", String(Math.round(principal)));
    prefilled.push("Utang awal");
  } else {
    missing.push("Utang awal");
  }

  const rate = terms.interest_rate;

  if (
    isMonthlyPeriod(terms.interest_period) &&
    typeof rate === "number" &&
    Number.isFinite(rate) &&
    rate >= SIMULATOR_LIMITS.minRate &&
    rate <= SIMULATOR_LIMITS.maxRate
  ) {
    params.set("rate", String(rate));
    prefilled.push("Bunga bulanan");
  } else {
    missing.push("Bunga bulanan");
  }

  // The analyzer contract has no tenor/duration field, so it always stays manual.
  missing.push("Durasi");

  const query = params.toString();

  return {
    href: query ? `/app/simulator?${query}` : "/app/simulator",
    prefilled,
    missing,
  };
}
