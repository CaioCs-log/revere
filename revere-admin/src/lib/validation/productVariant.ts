import { z } from "zod";

export const variantStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "archived",
]);

export const productVariantSchema = z
  .object({
    productId: z.string().min(1, "productId é obrigatório"),
    name: z.string().min(1, "Nome da variante é obrigatório"),
    sku: z
      .string()
      .min(1, "SKU é obrigatório")
      .transform((s) => s.trim().toUpperCase()),
    status: variantStatusSchema.default("draft"),
    portionLabel: z.string().min(1, "Rótulo de porção é obrigatório"),
    weightGrams: z.number().int().positive("Peso deve ser maior que 0"),
    priceCents: z.number().int().positive("Preço deve ser maior que 0"),
    compareAtPriceCents: z.number().int().nullable().optional(),
    isVisible: z.boolean().default(false),
    minQuantity: z.number().int().min(1).default(1),
    maxQuantity: z.number().int().nullable().optional(),
    isDefault: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })
  .refine(
    (data) => {
      if (
        data.compareAtPriceCents === null ||
        data.compareAtPriceCents === undefined
      )
        return true;
      return data.compareAtPriceCents > data.priceCents;
    },
    {
      message: "Preço comparativo deve ser maior que o preço original",
      path: ["compareAtPriceCents"],
    },
  );

export const activeVariantSchema = productVariantSchema.safeExtend({
  priceCents: z.number().int().positive("Preço deve ser maior que 0"),
  weightGrams: z.number().int().positive("Peso deve ser maior que 0"),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;
