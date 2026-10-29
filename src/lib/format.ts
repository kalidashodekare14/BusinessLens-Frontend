import { Organization } from "@/types/api";

export function formatCurrency(
  amount: string | number | null | undefined,
  currency: string = "USD"
): string {
  if (amount === null || amount === undefined || amount === "") return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "-";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

export function formatSignedPercent(
  value: number | null | undefined,
  fractionDigits: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(fractionDigits)}%`;
}

export const formatPercent = formatSignedPercent;

export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  try {
    return d.toLocaleDateString(undefined, options);
  } catch {
    return d.toISOString().split("T")[0];
  }
}

export function formatDateTime(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  try {
    return d.toLocaleString(undefined, options);
  } catch {
    return d.toISOString().replace("T", " ").split(".")[0];
  }
}

