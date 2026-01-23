/**
 * Formatting Utilities
 *
 * Pure functions for formatting dates, numbers, currencies, etc.
 */

/**
 * Format a date to a human-readable string.
 *
 * @example
 * ```ts
 * formatDate(new Date()) // "Jan 22, 2026"
 * formatDate(new Date(), { includeTime: true }) // "Jan 22, 2026, 2:30 PM"
 * formatDate(new Date(), { format: "iso" }) // "2026-01-22"
 * ```
 */
export function formatDate(
  date: Date | string | number,
  options: {
    includeTime?: boolean;
    format?: "short" | "long" | "iso";
    locale?: string;
  } = {}
): string {
  const { includeTime = false, format = "short", locale = "en-US" } = options;

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return "Invalid date";
  }

  if (format === "iso") {
    return d.toISOString().split("T")[0] ?? "";
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: format === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  };

  if (includeTime) {
    dateOptions.hour = "numeric";
    dateOptions.minute = "2-digit";
  }

  return new Intl.DateTimeFormat(locale, dateOptions).format(d);
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days").
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() + 86400000)) // "in 1 day"
 * ```
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = "en-US"
): string {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return "Invalid date";
  }

  const now = Date.now();
  const diff = d.getTime() - now;
  const absDiff = Math.abs(diff);

  // Time units in milliseconds
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absDiff < minute) {
    return rtf.format(Math.round(diff / 1000), "second");
  } else if (absDiff < hour) {
    return rtf.format(Math.round(diff / minute), "minute");
  } else if (absDiff < day) {
    return rtf.format(Math.round(diff / hour), "hour");
  } else if (absDiff < week) {
    return rtf.format(Math.round(diff / day), "day");
  } else if (absDiff < month) {
    return rtf.format(Math.round(diff / week), "week");
  } else if (absDiff < year) {
    return rtf.format(Math.round(diff / month), "month");
  } else {
    return rtf.format(Math.round(diff / year), "year");
  }
}

/**
 * Format a number as currency.
 *
 * @example
 * ```ts
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, "EUR") // "€1,234.56"
 * formatCurrency(1234.56, "USD", "de-DE") // "1.234,56 $"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format a number with locale-specific separators.
 *
 * @example
 * ```ts
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234567.89, { compact: true }) // "1.2M"
 * formatNumber(0.1234, { style: "percent" }) // "12%"
 * ```
 */
export function formatNumber(
  value: number,
  options: {
    compact?: boolean;
    style?: "decimal" | "percent";
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  } = {}
): string {
  const {
    compact = false,
    style = "decimal",
    minimumFractionDigits,
    maximumFractionDigits,
    locale = "en-US",
  } = options;

  return new Intl.NumberFormat(locale, {
    style,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}
