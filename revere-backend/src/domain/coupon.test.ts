import { describe, it, expect } from "vitest";
import {
  computeCouponDiscountCents,
  normalizeCouponCode,
  validateCoupon,
} from "./coupon";
import type { Coupon } from "./schemas";

const baseCoupon: Coupon = {
  code: "REVERE10",
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

const baseContext = {
  now: 1_700_000_000_000,
  isFirstPurchase: false,
  userUsageCount: 0,
  subtotalCents: 20000,
  itemProductIds: ["p1"],
  itemCategoryIds: ["c1"],
  itemKitPresetIds: [],
};

describe("normalizeCouponCode", () => {
  it("trims whitespace and uppercases", () => {
    expect(normalizeCouponCode("  revere10  ")).toBe("REVERE10");
  });

  it("keeps already-uppercase codes", () => {
    expect(normalizeCouponCode("REVERE10")).toBe("REVERE10");
  });
});

describe("validateCoupon — happy path", () => {
  it("accepts a valid active percentage coupon", () => {
    const result = validateCoupon(baseCoupon, baseContext);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discount.kind).toBe("percentage");
      expect(result.discount.discountCents).toBe(2000);
    }
  });

  it("accepts a fixed_amount coupon", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      discountType: "fixed_amount",
      discountPercent: null,
      discountAmountCents: 1500,
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discount.discountCents).toBe(1500);
    }
  });

  it("accepts a free_shipping coupon", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      discountType: "free_shipping",
      discountPercent: null,
      discountAmountCents: null,
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discount.kind).toBe("free_shipping");
      expect(result.discount.discountCents).toBe(0);
    }
  });
});

describe("validateCoupon — invalid cases", () => {
  it("rejects non-active status", () => {
    const coupon: Coupon = { ...baseCoupon, status: "expired" };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/status is expired/);
  });

  it("rejects coupon not yet started", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      startsAt: baseContext.now + 1000,
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/not active yet/);
  });

  it("rejects expired coupon", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      endsAt: baseContext.now - 1000,
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/expired/);
  });

  it("rejects when global usage limit reached", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      usageLimitTotal: 100,
      usageCount: 100,
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/usage limit/);
  });

  it("rejects when per-user usage limit reached", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      usageLimitPerUser: 1,
    };
    const result = validateCoupon(coupon, {
      ...baseContext,
      userUsageCount: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/per-user/);
  });

  it("rejects first-purchase-only when not first purchase", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      appliesTo: { ...baseCoupon.appliesTo, firstPurchaseOnly: true },
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/first purchase/);
  });

  it("accepts first-purchase-only when isFirstPurchase=true", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      appliesTo: { ...baseCoupon.appliesTo, firstPurchaseOnly: true },
    };
    const result = validateCoupon(coupon, {
      ...baseContext,
      isFirstPurchase: true,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects when subtotal below minimum", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      minimumSubtotalCents: 30000,
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/minimum/);
  });

  it("accepts when subtotal equals minimum (boundary)", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      minimumSubtotalCents: baseContext.subtotalCents,
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(true);
  });

  it("rejects when no items match product scope", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      appliesTo: { ...baseCoupon.appliesTo, productIds: ["p999"] },
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/scope/);
  });

  it("accepts when at least one product is in scope", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      appliesTo: { ...baseCoupon.appliesTo, productIds: ["p1", "p999"] },
    };
    const result = validateCoupon(coupon, baseContext);
    expect(result.ok).toBe(true);
  });

  it("rejects invalid coupon payload", () => {
    const result = validateCoupon(
      { ...baseCoupon, discountPercent: 150 },
      baseContext,
    );
    expect(result.ok).toBe(false);
  });
});

describe("computeCouponDiscountCents — caps", () => {
  it("caps percentage discount to maximumDiscountCents", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      discountPercent: 50,
      maximumDiscountCents: 500,
    };
    const result = computeCouponDiscountCents(coupon, 20000);
    expect(result.discountCents).toBe(500);
    expect(result.capped).toBe(true);
  });

  it("does not cap when below maximum", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      discountPercent: 10,
      maximumDiscountCents: 5000,
    };
    const result = computeCouponDiscountCents(coupon, 20000);
    expect(result.discountCents).toBe(2000);
    expect(result.capped).toBe(false);
  });

  it("caps fixed_amount to applicable subtotal", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      discountType: "fixed_amount",
      discountPercent: null,
      discountAmountCents: 5000,
    };
    const result = computeCouponDiscountCents(coupon, 1000);
    expect(result.discountCents).toBe(1000);
  });

  it("caps fixed_amount to maximumDiscountCents", () => {
    const coupon: Coupon = {
      ...baseCoupon,
      discountType: "fixed_amount",
      discountPercent: null,
      discountAmountCents: 5000,
      maximumDiscountCents: 2000,
    };
    const result = computeCouponDiscountCents(coupon, 10000);
    expect(result.discountCents).toBe(2000);
    expect(result.capped).toBe(true);
  });
});
