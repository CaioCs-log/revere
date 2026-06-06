import { describe, it, expect } from "vitest";
import {
  computeItemsSubtotalCents,
  computeLineSubtotalCents,
  computeLineSubtotalsCents,
  computePriceBreakdown,
  parsePriceInput,
  tryParsePriceInput,
} from "./price";
import { lineItemSchema } from "./schemas";

describe("lineItemSchema", () => {
  it("accepts a valid line item", () => {
    const result = lineItemSchema.safeParse({
      productId: "p1",
      variantId: "v1",
      quantity: 2,
      unitPriceCents: 2590,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive quantity", () => {
    const result = lineItemSchema.safeParse({
      productId: "p1",
      variantId: "v1",
      quantity: 0,
      unitPriceCents: 2590,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer unitPriceCents", () => {
    const result = lineItemSchema.safeParse({
      productId: "p1",
      variantId: "v1",
      quantity: 1,
      unitPriceCents: 10.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero unitPriceCents", () => {
    const result = lineItemSchema.safeParse({
      productId: "p1",
      variantId: "v1",
      quantity: 1,
      unitPriceCents: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("computeLineSubtotalCents", () => {
  it("multiplies unit price by quantity", () => {
    expect(computeLineSubtotalCents(2590, 3)).toBe(7770);
  });

  it("returns 0 when quantity is 0", () => {
    expect(computeLineSubtotalCents(2590, 0)).toBe(0);
  });

  it("returns 0 when unit price is 0", () => {
    expect(computeLineSubtotalCents(0, 5)).toBe(0);
  });

  it("throws on negative unit price", () => {
    expect(() => computeLineSubtotalCents(-1, 1)).toThrow(RangeError);
  });

  it("throws on non-integer unit price", () => {
    expect(() => computeLineSubtotalCents(10.5, 1)).toThrow(RangeError);
  });

  it("throws on negative quantity", () => {
    expect(() => computeLineSubtotalCents(100, -1)).toThrow(RangeError);
  });
});

describe("computeLineSubtotalsCents", () => {
  it("returns one subtotal per item", () => {
    const items = [
      { productId: "p1", variantId: "v1", quantity: 2, unitPriceCents: 1000 },
      { productId: "p2", variantId: "v2", quantity: 1, unitPriceCents: 2590 },
    ];
    expect(computeLineSubtotalsCents(items)).toEqual([2000, 2590]);
  });

  it("returns empty array for empty input", () => {
    expect(computeLineSubtotalsCents([])).toEqual([]);
  });
});

describe("computeItemsSubtotalCents", () => {
  it("sums all line subtotals", () => {
    const items = [
      { productId: "p1", variantId: "v1", quantity: 2, unitPriceCents: 2590 },
      { productId: "p2", variantId: "v2", quantity: 1, unitPriceCents: 1990 },
    ];
    expect(computeItemsSubtotalCents(items)).toBe(5180 + 1990);
  });

  it("returns 0 for empty input", () => {
    expect(computeItemsSubtotalCents([])).toBe(0);
  });
});

describe("computePriceBreakdown", () => {
  it("computes itemsSubtotalCents and per-line subtotals", () => {
    const breakdown = computePriceBreakdown({
      items: [
        {
          productId: "p1",
          variantId: "v1",
          quantity: 2,
          unitPriceCents: 2590,
        },
        {
          productId: "p2",
          variantId: "v2",
          quantity: 3,
          unitPriceCents: 1990,
        },
      ],
    });
    expect(breakdown.itemsSubtotalCents).toBe(5180 + 5970);
    expect(breakdown.lineSubtotals).toEqual([5180, 5970]);
  });

  it("rejects empty items array", () => {
    expect(() => computePriceBreakdown({ items: [] })).toThrow();
  });
});

describe("parsePriceInput / tryParsePriceInput", () => {
  it("parses valid input", () => {
    const parsed = parsePriceInput({
      items: [
        { productId: "p1", variantId: "v1", quantity: 1, unitPriceCents: 100 },
      ],
    });
    expect(parsed.items).toHaveLength(1);
  });

  it("returns error result for invalid input", () => {
    const result = tryParsePriceInput({
      items: [{ productId: "", variantId: "v1", quantity: 0, unitPriceCents: -1 }],
    });
    expect(result.success).toBe(false);
  });
});
