import { describe, it, expect } from "vitest";
import {
  DEFAULT_KIT_DISCOUNT_TIERS,
  applyKitDiscountPercent,
  computeKitDiscount,
  computeKitDiscountCents,
  pickKitDiscountPercent,
  validateKitComposition,
} from "./kit-discount";
import type { KitDiscountTier } from "./schemas";

describe("DEFAULT_KIT_DISCOUNT_TIERS (SPEC-003 / ADR-0003)", () => {
  it("has 3 tiers: 5%/8%/10%", () => {
    expect(DEFAULT_KIT_DISCOUNT_TIERS).toHaveLength(3);
    expect(DEFAULT_KIT_DISCOUNT_TIERS.map((t) => t.discountPercent)).toEqual([
      5, 8, 10,
    ]);
  });

  it("covers 7-9, 10-14, 15+", () => {
    expect(DEFAULT_KIT_DISCOUNT_TIERS[0]).toEqual({
      minItems: 7,
      maxItems: 9,
      discountPercent: 5,
    });
    expect(DEFAULT_KIT_DISCOUNT_TIERS[1]).toEqual({
      minItems: 10,
      maxItems: 14,
      discountPercent: 8,
    });
    expect(DEFAULT_KIT_DISCOUNT_TIERS[2]).toEqual({
      minItems: 15,
      maxItems: null,
      discountPercent: 10,
    });
  });
});

describe("pickKitDiscountPercent", () => {
  const tiers: KitDiscountTier[] = [
    { minItems: 5, maxItems: 9, discountPercent: 5 },
    { minItems: 10, maxItems: 14, discountPercent: 8 },
    { minItems: 15, maxItems: null, discountPercent: 10 },
  ];

  it("returns null below the lowest tier", () => {
    expect(pickKitDiscountPercent(4, tiers)).toBeNull();
  });

  it("returns the first tier at the lower boundary (5)", () => {
    expect(pickKitDiscountPercent(5, tiers)).toEqual(tiers[0]);
  });

  it("returns the first tier at the upper boundary (9)", () => {
    expect(pickKitDiscountPercent(9, tiers)).toEqual(tiers[0]);
  });

  it("returns the second tier at the lower boundary (10)", () => {
    expect(pickKitDiscountPercent(10, tiers)).toEqual(tiers[1]);
  });

  it("returns the second tier at the upper boundary (14)", () => {
    expect(pickKitDiscountPercent(14, tiers)).toEqual(tiers[1]);
  });

  it("returns the third tier at the lower boundary (15)", () => {
    expect(pickKitDiscountPercent(15, tiers)).toEqual(tiers[2]);
  });

  it("returns the third tier for large quantities (50)", () => {
    expect(pickKitDiscountPercent(50, tiers)).toEqual(tiers[2]);
  });

  it("returns null for negative count", () => {
    expect(pickKitDiscountPercent(-1, tiers)).toBeNull();
  });

  it("returns null for non-integer count", () => {
    expect(pickKitDiscountPercent(7.5, tiers)).toBeNull();
  });
});

describe("applyKitDiscountPercent", () => {
  it("computes percent of subtotal", () => {
    expect(applyKitDiscountPercent(10000, 5)).toBe(500);
    expect(applyKitDiscountPercent(10000, 8)).toBe(800);
    expect(applyKitDiscountPercent(10000, 10)).toBe(1000);
  });

  it("floors fractional results (R$ 19,90 × 5% = 99 cents, not 99.5)", () => {
    expect(applyKitDiscountPercent(1990, 5)).toBe(99);
  });

  it("returns 0 for 0% discount", () => {
    expect(applyKitDiscountPercent(10000, 0)).toBe(0);
  });

  it("returns subtotal for 100% discount", () => {
    expect(applyKitDiscountPercent(10000, 100)).toBe(10000);
  });

  it("throws on negative percent", () => {
    expect(() => applyKitDiscountPercent(1000, -1)).toThrow(RangeError);
  });

  it("throws on percent > 100", () => {
    expect(() => applyKitDiscountPercent(1000, 100.01)).toThrow(RangeError);
  });

  it("throws on negative subtotal", () => {
    expect(() => applyKitDiscountPercent(-1, 5)).toThrow(RangeError);
  });
});

describe("computeKitDiscountCents", () => {
  it("applies tier percent to subtotal", () => {
    expect(
      computeKitDiscountCents(19900, {
        minItems: 7,
        maxItems: 9,
        discountPercent: 5,
      }),
    ).toBe(995);
  });
});

describe("computeKitDiscount", () => {
  const baseInput = {
    minItems: 7,
    maxItems: null as number | null,
    discountTiers: DEFAULT_KIT_DISCOUNT_TIERS as unknown as KitDiscountTier[],
    grantsFreeShipping: false,
  };

  it("returns 0% and 0 cents when below minItems", () => {
    const result = computeKitDiscount({
      ...baseInput,
      itemCount: 6,
      subtotalCents: 19900,
    });
    expect(result.discountPercent).toBe(0);
    expect(result.discountCents).toBe(0);
    expect(result.appliedTier).toBeNull();
  });

  it("applies 5% for 7 items (lower boundary)", () => {
    const result = computeKitDiscount({
      ...baseInput,
      itemCount: 7,
      subtotalCents: 10000,
    });
    expect(result.discountPercent).toBe(5);
    expect(result.discountCents).toBe(500);
  });

  it("applies 5% for 9 items (upper boundary)", () => {
    const result = computeKitDiscount({
      ...baseInput,
      itemCount: 9,
      subtotalCents: 10000,
    });
    expect(result.discountPercent).toBe(5);
    expect(result.discountCents).toBe(500);
  });

  it("applies 8% for 10 items", () => {
    const result = computeKitDiscount({
      ...baseInput,
      itemCount: 10,
      subtotalCents: 10000,
    });
    expect(result.discountPercent).toBe(8);
    expect(result.discountCents).toBe(800);
  });

  it("applies 8% for 14 items", () => {
    const result = computeKitDiscount({
      ...baseInput,
      itemCount: 14,
      subtotalCents: 10000,
    });
    expect(result.discountPercent).toBe(8);
    expect(result.discountCents).toBe(800);
  });

  it("applies 10% for 15 items (lower boundary of top tier)", () => {
    const result = computeKitDiscount({
      ...baseInput,
      itemCount: 15,
      subtotalCents: 10000,
    });
    expect(result.discountPercent).toBe(10);
    expect(result.discountCents).toBe(1000);
  });

  it("applies 10% for 30 items (far into top tier)", () => {
    const result = computeKitDiscount({
      ...baseInput,
      itemCount: 30,
      subtotalCents: 10000,
    });
    expect(result.discountPercent).toBe(10);
    expect(result.discountCents).toBe(1000);
  });

  it("returns 0 discount when itemCount exceeds maxItems", () => {
    const result = computeKitDiscount({
      ...baseInput,
      minItems: 7,
      maxItems: 20,
      itemCount: 21,
      subtotalCents: 10000,
    });
    expect(result.discountPercent).toBe(0);
    expect(result.discountCents).toBe(0);
  });
});

describe("validateKitComposition", () => {
  it("validates a valid composition (min reached, repeated allowed)", () => {
    expect(
      validateKitComposition({
        minItems: 7,
        maxItems: null,
        allowRepeatedItems: true,
        uniqueItemCount: 3,
        itemCount: 7,
      }).valid,
    ).toBe(true);
  });

  it("rejects when itemCount < minItems", () => {
    const result = validateKitComposition({
      minItems: 7,
      maxItems: null,
      allowRepeatedItems: true,
      uniqueItemCount: 3,
      itemCount: 6,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("below minItems");
  });

  it("rejects when itemCount > maxItems", () => {
    const result = validateKitComposition({
      minItems: 7,
      maxItems: 20,
      allowRepeatedItems: true,
      uniqueItemCount: 20,
      itemCount: 21,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("above maxItems");
  });

  it("rejects repeated items when allowRepeatedItems is false", () => {
    const result = validateKitComposition({
      minItems: 7,
      maxItems: 14,
      allowRepeatedItems: false,
      uniqueItemCount: 5,
      itemCount: 7,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("repeated items");
  });

  it("accepts unique-only composition when allowRepeatedItems is false", () => {
    expect(
      validateKitComposition({
        minItems: 5,
        maxItems: 10,
        allowRepeatedItems: false,
        uniqueItemCount: 7,
        itemCount: 7,
      }).valid,
    ).toBe(true);
  });
});
