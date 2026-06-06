import {
  couponContextSchema,
  couponSchema,
  type Coupon,
  type CouponContext,
} from "./schemas";
import type { CouponDiscountBreakdown } from "./types";

export const normalizeCouponCode = (code: string): string => {
  return code.trim().toUpperCase();
};

const hasAnyItemInScope = (
  scopeIds: readonly string[],
  itemIds: readonly string[],
): boolean => {
  if (scopeIds.length === 0) return true;
  for (const id of itemIds) {
    if (scopeIds.includes(id)) return true;
  }
  return false;
};

const computeDiscountFromCoupon = (
  coupon: Coupon,
  applicableSubtotalCents: number,
): CouponDiscountBreakdown => {
  if (coupon.discountType === "free_shipping") {
    return { kind: "free_shipping", discountCents: 0, capped: false };
  }
  if (coupon.discountType === "percentage") {
    const percent = coupon.discountPercent ?? 0;
    const raw = Math.floor((applicableSubtotalCents * percent) / 100);
    const cap = coupon.maximumDiscountCents;
    if (cap !== null && raw > cap) {
      return { kind: "percentage", discountCents: cap, capped: true };
    }
    return { kind: "percentage", discountCents: raw, capped: false };
  }
  const amount = coupon.discountAmountCents ?? 0;
  const cap = coupon.maximumDiscountCents;
  const bounded = Math.min(amount, applicableSubtotalCents);
  if (cap !== null && bounded > cap) {
    return { kind: "fixed_amount", discountCents: cap, capped: true };
  }
  return { kind: "fixed_amount", discountCents: bounded, capped: false };
};

export type ValidCouponResult = {
  ok: true;
  coupon: Coupon;
  discount: CouponDiscountBreakdown;
  applicableSubtotalCents: number;
};

export type InvalidCouponResult = { ok: false; reason: string };

export const validateCoupon = (
  data: unknown,
  context: CouponContext,
): ValidCouponResult | InvalidCouponResult => {
  const parsed = couponSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.message };
  }
  const ctxParsed = couponContextSchema.safeParse(context);
  if (!ctxParsed.success) {
    return { ok: false, reason: ctxParsed.error.message };
  }
  const coupon = parsed.data;
  const ctx = ctxParsed.data;

  if (coupon.status !== "active") {
    return { ok: false, reason: `coupon status is ${coupon.status}` };
  }
  if (coupon.startsAt !== null && ctx.now < coupon.startsAt) {
    return { ok: false, reason: "coupon is not active yet" };
  }
  if (coupon.endsAt !== null && ctx.now > coupon.endsAt) {
    return { ok: false, reason: "coupon has expired" };
  }
  if (
    coupon.usageLimitTotal !== null &&
    coupon.usageCount >= coupon.usageLimitTotal
  ) {
    return { ok: false, reason: "coupon usage limit reached" };
  }
  if (
    coupon.usageLimitPerUser !== null &&
    ctx.userUsageCount >= coupon.usageLimitPerUser
  ) {
    return { ok: false, reason: "coupon per-user usage limit reached" };
  }
  if (coupon.appliesTo.firstPurchaseOnly && !ctx.isFirstPurchase) {
    return { ok: false, reason: "coupon is restricted to first purchase" };
  }

  const hasProductScope = coupon.appliesTo.productIds.length > 0;
  const hasCategoryScope = coupon.appliesTo.categoryIds.length > 0;
  const hasKitScope = coupon.appliesTo.kitPresetIds.length > 0;
  const noScope = !hasProductScope && !hasCategoryScope && !hasKitScope;

  if (!noScope) {
    const inProductScope = hasAnyItemInScope(
      coupon.appliesTo.productIds,
      ctx.itemProductIds,
    );
    const inCategoryScope = hasAnyItemInScope(
      coupon.appliesTo.categoryIds,
      ctx.itemCategoryIds,
    );
    const inKitScope = hasAnyItemInScope(
      coupon.appliesTo.kitPresetIds,
      ctx.itemKitPresetIds,
    );
    const matched =
      (hasProductScope && inProductScope) ||
      (hasCategoryScope && inCategoryScope) ||
      (hasKitScope && inKitScope);
    if (!matched) {
      return { ok: false, reason: "no items match coupon scope" };
    }
  }

  if (
    coupon.minimumSubtotalCents !== null &&
    ctx.subtotalCents < coupon.minimumSubtotalCents
  ) {
    return {
      ok: false,
      reason: `subtotal below coupon minimum of ${coupon.minimumSubtotalCents} cents`,
    };
  }

  const applicableSubtotalCents = ctx.subtotalCents;

  if (
    coupon.discountType !== "free_shipping" &&
    applicableSubtotalCents <= 0
  ) {
    return { ok: false, reason: "no applicable subtotal for coupon" };
  }

  const discount = computeDiscountFromCoupon(coupon, applicableSubtotalCents);
  return { ok: true, coupon, discount, applicableSubtotalCents };
};

export const computeCouponDiscountCents = (
  coupon: Coupon,
  applicableSubtotalCents: number,
): CouponDiscountBreakdown => {
  return computeDiscountFromCoupon(coupon, applicableSubtotalCents);
};
