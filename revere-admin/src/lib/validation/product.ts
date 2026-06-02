import { z } from "zod";

export const productStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "archived",
]);
export const imageModeSchema = z.enum([
  "real_photo",
  "brand_placeholder",
  "editorial",
  "illustration",
]);
export const productTypeSchema = z.enum([
  "frozen_meal",
  "frozen_snack",
  "other",
]);

export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  shortDescription: z
    .string()
    .min(1, "Descrição curta é obrigatória")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(1, "Descrição completa é obrigatória")
    .optional()
    .or(z.literal("")),
  status: productStatusSchema.default("draft"),
  isVisible: z.boolean().default(false),
  productType: productTypeSchema.default("frozen_meal"),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  imageIds: z.array(z.string()).default([]),
  mainImageId: z.string().nullable().default(null),
  mainImageAlt: z.string().nullable().default(null),
  imageMode: imageModeSchema.default("brand_placeholder"),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  nutritionalHighlights: z.array(z.string()).default([]),
  storageInstructions: z.string().default(""),
  consumptionInstructions: z.string().default(""),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

// For active products, some fields become mandatory
export const activeProductSchema = productSchema.extend({
  shortDescription: z
    .string()
    .min(1, "Descrição curta é obrigatória para produtos ativos"),
  description: z
    .string()
    .min(1, "Descrição completa é obrigatória para produtos ativos"),
  categoryIds: z
    .array(z.string())
    .min(1, "Pelo menos uma categoria é obrigatória para produtos ativos"),
  imageMode: imageModeSchema,
});

export type ProductInput = z.infer<typeof productSchema>;
