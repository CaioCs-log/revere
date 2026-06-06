import {
  kitCompositionInputSchema,
  kitDiscountInputSchema,
  type KitCompositionInput,
  type KitDiscountInput,
  type KitDiscountTier,
} from "./schemas";
import type { KitDiscountBreakdown } from "./types";

export const DEFAULT_KIT_DISCOUNT_TIERS: readonly KitDiscountTier[] =
  Object.freeze([
    { minItems: 7, maxItems: 9, discountPercent: 5 },
    { minItems: 10, maxItems: 14, discountPercent: 8 },
    { minItems: 15, maxItems: null, discountPercent: 10 },
  ]);

export const pickKitDiscountPercent = (
  itemCount: number,
  tiers: readonly KitDiscountTier[],
): KitDiscountTier | null => {
  if (!Number.isInteger(itemCount) || itemCount < 0) return null;
  for (const tier of tiers) {
    const maxItems = tier.maxItems;
    if (itemCount < tier.minItems) continue;
    if (maxItems === null || itemCount <= maxItems) {
      return tier;
    }
  }
  return null;
};

export const applyKitDiscountPercent = (
  subtotalCents: number,
  percent: number,
): number => {
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) {
    throw new RangeError("subtotalCents must be a non-negative integer");
  }
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError("percent must be between 0 and 100");
  }
  return Math.floor((subtotalCents * percent) / 100);
};

export const computeKitDiscountCents = (
  subtotalCents: number,
  tier: KitDiscountTier,
): number => {
  return applyKitDiscountPercent(subtotalCents, tier.discountPercent);
};

export const computeKitDiscount = (
  input: KitDiscountInput,
): KitDiscountBreakdown => {
  const parsed = kitDiscountInputSchema.parse(input);
  if (parsed.itemCount < parsed.minItems) {
    return { discountPercent: 0, discountCents: 0, appliedTier: null };
  }
  if (parsed.maxItems !== null && parsed.itemCount > parsed.maxItems) {
    return { discountPercent: 0, discountCents: 0, appliedTier: null };
  }
  const tier = pickKitDiscountPercent(parsed.itemCount, parsed.discountTiers);
  if (tier === null) {
    return { discountPercent: 0, discountCents: 0, appliedTier: null };
  }
  const discountCents = computeKitDiscountCents(parsed.subtotalCents, tier);
  return {
    discountPercent: tier.discountPercent,
    discountCents,
    appliedTier: tier,
  };
};

export const validateKitComposition = (
  input: KitCompositionInput,
): { valid: boolean; reason: string | null } => {
  const parsed = kitCompositionInputSchema.parse(input);
  if (parsed.itemCount < parsed.minItems) {
    return {
      valid: false,
      reason: `itemCount ${parsed.itemCount} is below minItems ${parsed.minItems}`,
    };
  }
  if (parsed.maxItems !== null && parsed.itemCount > parsed.maxItems) {
    return {
      valid: false,
      reason: `itemCount ${parsed.itemCount} is above maxItems ${parsed.maxItems}`,
    };
  }
  if (!parsed.allowRepeatedItems && parsed.uniqueItemCount < parsed.itemCount) {
    return {
      valid: false,
      reason: "kit does not allow repeated items",
    };
  }
  return { valid: true, reason: null };
};
