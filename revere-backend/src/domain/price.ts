import { z } from "zod";
import { priceInputSchema, type PriceInput, type LineItem } from "./schemas";
import type { PriceBreakdown } from "./types";

export const parsePriceInput = (data: unknown): PriceInput => {
  return priceInputSchema.parse(data);
};

export const tryParsePriceInput = (
  data: unknown,
): z.SafeParseReturnType<unknown, PriceInput> => {
  return priceInputSchema.safeParse(data);
};

export const computeLineSubtotalCents = (
  unitPriceCents: number,
  quantity: number,
): number => {
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    throw new RangeError("unitPriceCents must be a non-negative integer");
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError("quantity must be a non-negative integer");
  }
  return unitPriceCents * quantity;
};

export const computeLineSubtotalsCents = (items: LineItem[]): number[] => {
  return items.map((item) =>
    computeLineSubtotalCents(item.unitPriceCents, item.quantity),
  );
};

export const computeItemsSubtotalCents = (items: LineItem[]): number => {
  return computeLineSubtotalsCents(items).reduce((sum, n) => sum + n, 0);
};

export const computePriceBreakdown = (input: PriceInput): PriceBreakdown => {
  const parsed = priceInputSchema.parse(input);
  const lineSubtotals = computeLineSubtotalsCents(parsed.items);
  const itemsSubtotalCents = lineSubtotals.reduce((sum, n) => sum + n, 0);
  return { itemsSubtotalCents, lineSubtotals };
};

export const tryComputePriceBreakdown = (
  data: unknown,
):
  | { ok: true; breakdown: PriceBreakdown }
  | { ok: false; reason: string } => {
  const result = priceInputSchema.safeParse(data);
  if (!result.success) {
    return { ok: false, reason: result.error.message };
  }
  const lineSubtotals = computeLineSubtotalsCents(result.data.items);
  const itemsSubtotalCents = lineSubtotals.reduce((sum, n) => sum + n, 0);
  return {
    ok: true,
    breakdown: { itemsSubtotalCents, lineSubtotals },
  };
};
