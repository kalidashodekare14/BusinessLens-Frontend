import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatSignedPercent } from "@/lib/format";

describe("format utils", () => {
  it("formats currency", () => {
    const result = formatCurrency(1234.56, "USD");
    expect(result).toContain("1,234.56");
  });

  it("formats signed percent", () => {
    expect(formatSignedPercent(0.05)).toBe("+5.0%");
    expect(formatSignedPercent(-0.1)).toBe("-10.0%");
    expect(formatSignedPercent(0)).toBe("0.0%");
  });

  it("formats dates", () => {
    expect(formatDate("2024-01-01")).toBeTruthy();
    expect(formatDate(null)).toBe("-");
  });
});
