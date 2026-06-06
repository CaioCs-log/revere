import { z } from "zod";

export const moneyCentsSchema = z
  .number()
  .int("priceCents must be an integer")
  .min(0, "priceCents must be >= 0");

export const positiveMoneyCentsSchema = moneyCentsSchema.refine(
  (n) => n > 0,
  { message: "priceCents must be > 0" },
);

export const percentSchema = z
  .number()
  .min(0, "percent must be >= 0")
  .max(100, "percent must be <= 100");

export const positiveIntSchema = z
  .number()
  .int("value must be an integer")
  .min(1, "value must be >= 1");

export const nonNegativeIntSchema = z
  .number()
  .int("value must be an integer")
  .min(0, "value must be >= 0");

export const lineItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: positiveIntSchema,
  unitPriceCents: positiveMoneyCentsSchema,
});

export type LineItem = z.infer<typeof lineItemSchema>;

export const priceInputSchema = z.object({
  items: z.array(lineItemSchema).min(1, "items must not be empty"),
});

export type PriceInput = z.infer<typeof priceInputSchema>;

export const kitItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: positiveIntSchema,
});

export const kitDiscountTierSchema = z
  .object({
    minItems: positiveIntSchema,
    maxItems: z.union([positiveIntSchema, z.null()]),
    discountPercent: percentSchema,
  })
  .refine((tier) => tier.maxItems === null || tier.maxItems >= tier.minItems, {
    message: "maxItems must be >= minItems",
  })
  .refine((tier) => tier.discountPercent > 0, {
    message: "discountPercent must be > 0",
  });

export type KitDiscountTier = z.infer<typeof kitDiscountTierSchema>;

export const kitDiscountInputSchema = z.object({
  minItems: positiveIntSchema,
  maxItems: z.union([positiveIntSchema, z.null()]),
  discountTiers: z.array(kitDiscountTierSchema).min(1),
  grantsFreeShipping: z.boolean(),
  itemCount: nonNegativeIntSchema,
  subtotalCents: nonNegativeIntSchema,
});

export type KitDiscountInput = z.infer<typeof kitDiscountInputSchema>;

export const kitCompositionInputSchema = z.object({
  minItems: positiveIntSchema,
  maxItems: z.union([positiveIntSchema, z.null()]),
  allowRepeatedItems: z.boolean(),
  uniqueItemCount: nonNegativeIntSchema,
  itemCount: nonNegativeIntSchema,
});

export type KitCompositionInput = z.infer<typeof kitCompositionInputSchema>;

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(1)
      .transform((s) => s.trim().toUpperCase()),
    status: z.enum([
      "draft",
      "active",
      "inactive",
      "expired",
      "archived",
    ]),
    discountType: z.enum(["percentage", "fixed_amount", "free_shipping"]),
    discountPercent: z.union([percentSchema, z.null()]),
    discountAmountCents: z.union([moneyCentsSchema, z.null()]),
    appliesTo: z.object({
      productIds: z.array(z.string().min(1)),
      categoryIds: z.array(z.string().min(1)),
      kitPresetIds: z.array(z.string().min(1)),
      firstPurchaseOnly: z.boolean(),
    }),
    minimumSubtotalCents: z.union([nonNegativeIntSchema, z.null()]),
    maximumDiscountCents: z.union([nonNegativeIntSchema, z.null()]),
    usageLimitTotal: z.union([positiveIntSchema, z.null()]),
    usageLimitPerUser: z.union([positiveIntSchema, z.null()]),
    usageCount: nonNegativeIntSchema,
    startsAt: z.union([z.number().int(), z.null()]),
    endsAt: z.union([z.number().int(), z.null()]),
  })
  .refine(
    (c) =>
      c.discountType !== "percentage" ||
      (c.discountPercent !== null && c.discountPercent > 0),
    {
      message: "percentage discount requires discountPercent > 0",
      path: ["discountPercent"],
    },
  )
  .refine(
    (c) =>
      c.discountType !== "fixed_amount" ||
      (c.discountAmountCents !== null && c.discountAmountCents > 0),
    {
      message: "fixed_amount discount requires discountAmountCents > 0",
      path: ["discountAmountCents"],
    },
  )
  .refine(
    (c) =>
      c.startsAt === null ||
      c.endsAt === null ||
      c.startsAt <= c.endsAt,
    {
      message: "startsAt must be <= endsAt",
      path: ["endsAt"],
    },
  );

export type Coupon = z.infer<typeof couponSchema>;

export const couponContextSchema = z.object({
  now: z.number().int().nonnegative(),
  isFirstPurchase: z.boolean(),
  userUsageCount: nonNegativeIntSchema,
  subtotalCents: nonNegativeIntSchema,
  itemProductIds: z.array(z.string().min(1)),
  itemCategoryIds: z.array(z.string().min(1)),
  itemKitPresetIds: z.array(z.string().min(1)),
});

export type CouponContext = z.infer<typeof couponContextSchema>;

export const neighborhoodSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "inactive"]),
  deliveryFeeCents: nonNegativeIntSchema,
  freeShippingMinimumCents: z.union([nonNegativeIntSchema, z.null()]),
});

export type Neighborhood = z.infer<typeof neighborhoodSchema>;

export const shippingInputSchema = z.object({
  neighborhood: neighborhoodSchema,
  itemsSubtotalCents: nonNegativeIntSchema,
  grantsFreeShipping: z.boolean(),
});

export type ShippingInput = z.infer<typeof shippingInputSchema>;
