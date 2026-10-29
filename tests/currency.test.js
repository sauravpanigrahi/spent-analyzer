import { describe, expect, it } from "vitest";
import {
  convertAmountFromBase,
  convertAmountToBase,
} from "../src/utils/currency.js";

describe("currency conversion", () => {
  it("derives each display value from the unchanged base amount", () => {
    const storedInr = 12500;
    const usdRate = 0.012;
    const eurRate = 0.011;

    expect(convertAmountFromBase(storedInr, usdRate)).toBe(150);
    expect(convertAmountFromBase(storedInr, eurRate)).toBe(137.5);
    expect(convertAmountToBase(150, usdRate)).toBe(storedInr);
    expect(storedInr).toBe(12500);
  });

  it("preserves values when a rate is invalid", () => {
    expect(convertAmountFromBase(100, 0)).toBe(100);
    expect(convertAmountToBase(100, Number.NaN)).toBe(100);
    expect(convertAmountFromBase(Number.NaN, 1.2)).toBe(0);
  });
});
