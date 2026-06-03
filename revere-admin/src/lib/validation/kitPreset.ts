import { z } from "zod";
import { imageModeSchema, productTypeSchema } from "./product";

export const kitStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "archived",
]);

export const kitTypeSchema = z.enum(["fixed", "suggested", "customizable"]);
export const pricingModeSchema = z.enum(["sum_items", "fixed_price"]);

export const defaultKitDiscountTiers = [
  { minItems: 7, maxItems: 9, discountPercent: 5 },
  { minItems: 10, maxItems: 14, discountPercent: 8 },
  { minItems: 15, maxItems: null, discountPercent: 10 },
] as const;

export const kitItemSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  variantId: z.string().min(1, "Variante é obrigatória"),
  quantity: z.number().int().positive("Quantidade deve ser maior que 0"),
});

export const discountTierSchema = z.object({
  minItems: z.number().int().positive("Mínimo deve ser maior que 0"),
  maxItems: z.number().int().positive().nullable(),
  discountPercent: z.number().int().min(0).max(100),
});

const tiersMatchExpected = (
  tiers: {
    minItems: number;
    maxItems: number | null;
    discountPercent: number;
  }[],
) => {
  if (tiers.length !== defaultKitDiscountTiers.length) return false;

  return defaultKitDiscountTiers.every((expected, index) => {
    const current = tiers[index];
    return (
      current?.minItems === expected.minItems &&
      current?.maxItems === expected.maxItems &&
      current?.discountPercent === expected.discountPercent
    );
  });
};

export const kitPresetSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    slug: z.string().min(1, "Slug é obrigatório"),
    status: kitStatusSchema.default("draft"),
    shortDescription: z.string().default(""),
    description: z.string().default(""),
    imageId: z.string().nullable().default(null),
    imageAlt: z.string().nullable().default(null),
    imageMode: imageModeSchema.default("brand_placeholder"),
    kitType: kitTypeSchema.default("fixed"),
    eligibleProductTypes: z.array(productTypeSchema).default(["frozen_meal"]),
    allowRepeatedItems: z.boolean().default(true),
    items: z.array(kitItemSchema).default([]),
    minItems: z.number().int().min(1).default(7),
    maxItems: z.number().int().positive().nullable().default(null),
    pricingMode: pricingModeSchema.default("sum_items"),
    fixedPriceCents: z.number().int().positive().nullable().default(null),
    discountTiers: z
      .array(discountTierSchema)
      .default(defaultKitDiscountTiers.map((tier) => ({ ...tier }))),
    grantsFreeShipping: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })
  .superRefine((data, ctx) => {
    if (data.status === "active" && !data.description.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descrição é obrigatória para kits ativos",
        path: ["description"],
      });
    }

    if (
      (data.kitType === "fixed" || data.kitType === "suggested") &&
      data.items.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kits fixed e suggested exigem pelo menos um item",
        path: ["items"],
      });
    }

    if (data.kitType === "customizable") {
      if (data.minItems !== 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kits customizáveis devem ter minItems = 7 no MVP",
          path: ["minItems"],
        });
      }

      if (
        data.eligibleProductTypes.length === 0 ||
        !data.eligibleProductTypes.every((type) => type === "frozen_meal")
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Apenas frozen_meal é elegível para kits customizáveis com desconto no MVP",
          path: ["eligibleProductTypes"],
        });
      }

      if (!tiersMatchExpected(data.discountTiers)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "discountTiers devem seguir as faixas 5% / 8% / 10%",
          path: ["discountTiers"],
        });
      }
    }

    if (data.pricingMode === "fixed_price" && !data.fixedPriceCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "fixedPriceCents é obrigatório quando o preço é fixo",
        path: ["fixedPriceCents"],
      });
    }

    if (data.pricingMode === "sum_items" && data.fixedPriceCents !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "fixedPriceCents deve ficar vazio quando o preço é calculado pela soma dos itens",
        path: ["fixedPriceCents"],
      });
    }
  });

export type KitPresetInput = z.infer<typeof kitPresetSchema>;
