import {
  neighborhoodSchema,
  shippingInputSchema,
  type Neighborhood,
  type ShippingInput,
} from "./schemas";
import type { ShippingBreakdown } from "./types";

export const computeShippingFeeCents = (
  input: ShippingInput,
): ShippingBreakdown => {
  const parsed = shippingInputSchema.parse(input);
  return computeShippingBreakdown(parsed);
};

export const tryComputeShippingFeeCents = (
  data: unknown,
):
  | { ok: true; breakdown: ShippingBreakdown }
  | { ok: false; reason: string } => {
  const result = shippingInputSchema.safeParse(data);
  if (!result.success) {
    return { ok: false, reason: result.error.message };
  }
  return { ok: true, breakdown: computeShippingBreakdown(result.data) };
};

export const computeShippingBreakdown = (
  input: {
    neighborhood: Neighborhood;
    itemsSubtotalCents: number;
    grantsFreeShipping: boolean;
  },
): ShippingBreakdown => {
  const { neighborhood, itemsSubtotalCents, grantsFreeShipping } = input;
  neighborhoodSchema.parse(neighborhood);
  if (!Number.isInteger(itemsSubtotalCents) || itemsSubtotalCents < 0) {
    throw new RangeError("itemsSubtotalCents must be a non-negative integer");
  }

  if (neighborhood.status !== "active") {
    return { feeCents: neighborhood.deliveryFeeCents, freeReason: "none" };
  }

  if (grantsFreeShipping) {
    return { feeCents: 0, freeReason: "kit" };
  }

  const minimum = neighborhood.freeShippingMinimumCents;
  if (minimum !== null && itemsSubtotalCents >= minimum) {
    return { feeCents: 0, freeReason: "subtotal_minimum" };
  }

  return { feeCents: neighborhood.deliveryFeeCents, freeReason: "none" };
};
