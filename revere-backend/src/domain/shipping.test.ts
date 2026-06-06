import { describe, it, expect } from "vitest";
import {
  computeShippingBreakdown,
  computeShippingFeeCents,
  tryComputeShippingFeeCents,
} from "./shipping";
import type { Neighborhood } from "./schemas";

const baseNeighborhood: Neighborhood = {
  id: "n1",
  status: "active",
  deliveryFeeCents: 1200,
  freeShippingMinimumCents: 19900,
};

describe("computeShippingBreakdown — happy paths", () => {
  it("returns full fee when below free-shipping minimum", () => {
    const result = computeShippingBreakdown({
      neighborhood: baseNeighborhood,
      itemsSubtotalCents: 10000,
      grantsFreeShipping: false,
    });
    expect(result.feeCents).toBe(1200);
    expect(result.freeReason).toBe("none");
  });

  it("returns 0 when subtotal equals minimum (boundary)", () => {
    const result = computeShippingBreakdown({
      neighborhood: baseNeighborhood,
      itemsSubtotalCents: 19900,
      grantsFreeShipping: false,
    });
    expect(result.feeCents).toBe(0);
    expect(result.freeReason).toBe("subtotal_minimum");
  });

  it("returns 0 when subtotal exceeds minimum", () => {
    const result = computeShippingBreakdown({
      neighborhood: baseNeighborhood,
      itemsSubtotalCents: 50000,
      grantsFreeShipping: false,
    });
    expect(result.feeCents).toBe(0);
    expect(result.freeReason).toBe("subtotal_minimum");
  });

  it("kit-granted free shipping takes precedence over subtotal", () => {
    const result = computeShippingBreakdown({
      neighborhood: { ...baseNeighborhood, deliveryFeeCents: 1500 },
      itemsSubtotalCents: 1000,
      grantsFreeShipping: true,
    });
    expect(result.feeCents).toBe(0);
    expect(result.freeReason).toBe("kit");
  });

  it("returns 0 fee when deliveryFeeCents is 0 and no minimum set", () => {
    const result = computeShippingBreakdown({
      neighborhood: {
        ...baseNeighborhood,
        deliveryFeeCents: 0,
        freeShippingMinimumCents: null,
      },
      itemsSubtotalCents: 100,
      grantsFreeShipping: false,
    });
    expect(result.feeCents).toBe(0);
    expect(result.freeReason).toBe("none");
  });
});

describe("computeShippingBreakdown — boundaries and invalid", () => {
  it("ignores minimum when freeShippingMinimumCents is null", () => {
    const result = computeShippingBreakdown({
      neighborhood: { ...baseNeighborhood, freeShippingMinimumCents: null },
      itemsSubtotalCents: 999999,
      grantsFreeShipping: false,
    });
    expect(result.feeCents).toBe(1200);
  });

  it("treats inactive neighborhood as still paying the listed fee (no promo)", () => {
    const result = computeShippingBreakdown({
      neighborhood: { ...baseNeighborhood, status: "inactive" },
      itemsSubtotalCents: 50000,
      grantsFreeShipping: false,
    });
    expect(result.feeCents).toBe(1200);
    expect(result.freeReason).toBe("none");
  });

  it("throws on negative deliveryFeeCents", () => {
    expect(() =>
      computeShippingBreakdown({
        neighborhood: { ...baseNeighborhood, deliveryFeeCents: -1 },
        itemsSubtotalCents: 1000,
        grantsFreeShipping: false,
      }),
    ).toThrow();
  });

  it("throws on negative itemsSubtotalCents", () => {
    expect(() =>
      computeShippingBreakdown({
        neighborhood: baseNeighborhood,
        itemsSubtotalCents: -1,
        grantsFreeShipping: false,
      }),
    ).toThrow();
  });

  it("throws on invalid neighborhood (empty id)", () => {
    expect(() =>
      computeShippingBreakdown({
        neighborhood: { ...baseNeighborhood, id: "" },
        itemsSubtotalCents: 1000,
        grantsFreeShipping: false,
      }),
    ).toThrow();
  });
});

describe("computeShippingFeeCents / tryComputeShippingFeeCents", () => {
  it("returns the fee directly", () => {
    expect(
      computeShippingFeeCents({
        neighborhood: baseNeighborhood,
        itemsSubtotalCents: 1000,
        grantsFreeShipping: false,
      }).feeCents,
    ).toBe(1200);
  });

  it("tryCompute returns ok:true on valid input", () => {
    const result = tryComputeShippingFeeCents({
      neighborhood: baseNeighborhood,
      itemsSubtotalCents: 1000,
      grantsFreeShipping: false,
    });
    expect(result.ok).toBe(true);
  });

  it("tryCompute returns ok:false on invalid input", () => {
    const result = tryComputeShippingFeeCents({
      neighborhood: { ...baseNeighborhood, deliveryFeeCents: -1 },
      itemsSubtotalCents: 1000,
      grantsFreeShipping: false,
    });
    expect(result.ok).toBe(false);
  });
});
