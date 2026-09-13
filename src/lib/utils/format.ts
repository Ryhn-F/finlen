/**
 * Indonesian financial formatting helpers.
 * All numeric output is rendered with Geist Mono in the UI (see design.md §3.2).
 */

const idNumber = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const idDecimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const idLongDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * `3000000` -> `Rp 3.000.000`
 * Non-IDR currency codes keep their own prefix instead of being mislabeled as Rupiah.
 */
export function formatCurrency(
  value: number,
  currency?: string | null,
): string {
  const amount = idNumber.format(Math.round(value));
  const code = (currency || "IDR").toUpperCase();
  return code === "IDR" ? `Rp ${amount}` : `${code} ${amount}`;
}

/** `5` -> `5%`, `2.5` -> `2,5%` */
export function formatPercentage(value: number): string {
  return `${idDecimal.format(value)}%`;
}

/**
 * `"2026-09-15"` -> `15 September 2026`.
 * Unparsable backend strings are returned as-is instead of showing `Invalid Date`.
 */
export function formatIndonesianDate(value: string): string {
  const trimmed = value.trim();

  // Date-only strings are parsed as local time so the day never shifts
  // because of the viewer's timezone offset.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    const local = new Date(Number(year), Number(month) - 1, Number(day));
    if (Number.isNaN(local.getTime())) return trimmed;
    return idLongDate.format(local);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return idLongDate.format(parsed);
}

/** `2516582` -> `2,4 MB` */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes >= 1024 * 1024) {
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB`;
  }
  const kilobytes = Math.max(1, Math.round(bytes / 1024));
  return `${idNumber.format(kilobytes)} KB`;
}
