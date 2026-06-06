import { describe, it, expect } from "vitest";
import {
  couponSchema,
  kitDiscountTierSchema,
  lineItemSchema,
  neighborhoodSchema,
  shippingInputSchema,
} from "./schemas";

describe("kitDiscountTierSchema", () => {
  it("accepts a valid tier with maxItems", () => {
    const result = kitDiscountTierSchema.safeParse({
      minItems: 7,
      maxItems: 9,
      discountPercent: 5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid tier with null maxItems", () => {
    const result = kitDiscountTierSchema.safeParse({
      minItems: 15,
      maxItems: null,
      discountPercent: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects maxItems < minItems", () => {
    const result = kitDiscountTierSchema.safeParse({
      minItems: 10,
      maxItems: 5,
      discountPercent: 8,
    });
    expect(result.success).toBe(false);
  });

  it("rejects discountPercent = 0", () => {
    const result = kitDiscountTierSchema.safeParse({
      minItems: 7,
      maxItems: 9,
      discountPercent: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects discountPercent > 100", () => {
    const result = kitDiscountTierSchema.safeParse({
      minItems: 7,
      maxItems: 9,
      discountPercent: 150,
    });
    expect(result.success).toBe(false);
  });
});

describe("couponSchema", () => {
  const base = {
    status: "active",
    discountType: "percentage",
    discountPercent: 10,
    discountAmountCents: null,
    appliesTo: {
      productIds: [],
      categoryIds: [],
      kitPresetIds: [],
      firstPurchaseOnly: false,
    },
    minimumSubtotalCents: null,
    maximumDiscountCents: null,
    usageLimitTotal: null,
    usageLimitPerUser: null,
    usageCount: 0,
    startsAt: null,
    endsAt: null,
  };

  it("normalizes code to uppercase", () => {
    const result = couponSchema.safeParse({ ...base, code: "  revere10  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.code).toBe("REVERE10");
  });

  it("rejects percentage discount with null percent", () => {
    const result = couponSchema.safeParse({ ...base, discountPercent: null });
    expect(result.success).toBe(false);
  });

  it("rejects fixed_amount with null amount", () => {
    const result = couponSchema.safeParse({
      ...base,
      discountType: "fixed_amount",
      discountPercent: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects startsAt > endsAt", () => {
    const result = couponSchema.safeParse({
      ...base,
      startsAt: 2000,
      endsAt: 1000,
    });
    expect(result.success).toBe(false);
  });
});

describe("neighborhoodSchema", () => {
  it("accepts a valid active neighborhood", () => {
    const result = neighborhoodSchema.safeParse({
      id: "n1",
      status: "active",
      deliveryFeeCents: 1000,
      freeShippingMinimumCents: 19900,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative deliveryFeeCents", () => {
    const result = neighborhoodSchema.safeParse({
      id: "n1",
      status: "active",
      deliveryFeeCents: -1,
      freeShippingMinimumCents: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("shippingInputSchema", () => {
  it("rejects when itemsSubtotalCents is negative", () => {
    const result = shippingInputSchema.safeParse({
      neighborhood: {
        id: "n1",
        status: "active",
        deliveryFeeCents: 100,
        freeShippingMinimumCents: null,
      },
      itemsSubtotalCents: -10,
      grantsFreeShipping: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("lineItemSchema", () => {
  it("rejects empty productId", () => {
    const result = lineItemSchema.safeParse({
      productId: "",
      variantId: "v1",
      quantity: 1,
      unitPriceCents: 100,
    });
    expect(result.success).toBe(false);
  });
});
