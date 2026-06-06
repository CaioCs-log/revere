import type {
  Coupon,
  KitDiscountTier,
  LineItem,
  Neighborhood,
} from "./schemas";

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; reason: string };
export type Result<T> = Ok<T> | Err;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = (reason: string): Err => ({ ok: false, reason });

export interface PriceBreakdown {
  itemsSubtotalCents: number;
  lineSubtotals: number[];
}

export interface KitDiscountBreakdown {
  discountPercent: number;
  discountCents: number;
  appliedTier: KitDiscountTier | null;
}

export type CouponDiscountBreakdown =
  | {
      kind: "percentage" | "fixed_amount" | "free_shipping";
      discountCents: number;
      capped: boolean;
    };

export interface ShippingBreakdown {
  feeCents: number;
  freeReason: "kit" | "subtotal_minimum" | "none";
}

export type CouponValidationResult =
  | { ok: true; coupon: Coupon; discount: CouponDiscountBreakdown }
  | { ok: false; reason: string };

export interface PriceLinesInput {
  items: LineItem[];
}

export interface KitDiscountOutput {
  discountPercent: number;
  discountCents: number;
}

export interface KitCompositionOutput {
  valid: boolean;
  reason: string | null;
}

export interface ShippingContext {
  neighborhood: Neighborhood;
  itemsSubtotalCents: number;
  grantsFreeShipping: boolean;
}
