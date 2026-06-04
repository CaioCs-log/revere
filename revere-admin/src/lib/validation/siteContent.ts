import { z } from "zod";
import { imageModeSchema } from "./product";

export const siteContentStatusSchema = z.enum([
  "draft",
  "published",
  "inactive",
  "archived",
]);

export const siteContentTypeSchema = z.enum([
  "home_hero",
  "home_how_it_works",
  "home_product_highlight",
  "home_kit_highlight",
  "home_category_highlight",
  "campaign_banner",
  "notice",
  "delivery_info",
  "checkout_notice",
  "final_cta",
  "faq_preview",
  "social_proof",
  "generic",
]);

export const displayRulesSchema = z.object({
  startsAt: z.string().nullable().default(null),
  endsAt: z.string().nullable().default(null),
  priority: z.number().int().default(0),
  showOnHome: z.boolean().default(false),
  showOnCheckout: z.boolean().default(false),
  showOnCatalog: z.boolean().default(false),
});

export const siteContentSchema = z
  .object({
    key: z.string().min(1, "Key é obrigatória"),
    status: siteContentStatusSchema.default("draft"),
    type: siteContentTypeSchema,
    title: z.string().nullable().default(null),
    subtitle: z.string().nullable().default(null),
    body: z.string().nullable().default(null),
    imageId: z.string().nullable().default(null),
    imageAlt: z.string().nullable().default(null),
    imageMode: imageModeSchema.default("brand_placeholder"),
    ctaLabel: z.string().nullable().default(null),
    ctaHref: z.string().nullable().default(null),
    linkedProductIds: z.array(z.string()).default([]),
    linkedCategoryIds: z.array(z.string()).default([]),
    linkedKitPresetIds: z.array(z.string()).default([]),
    displayRules: displayRulesSchema.default({
      startsAt: null,
      endsAt: null,
      priority: 0,
      showOnHome: false,
      showOnCheckout: false,
      showOnCatalog: false,
    }),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((data, ctx) => {
    if ((data.ctaLabel && !data.ctaHref) || (!data.ctaLabel && data.ctaHref)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CTA exige ctaLabel e ctaHref juntos",
        path: ["ctaLabel"],
      });
    }
  });

export type SiteContentInput = z.infer<typeof siteContentSchema>;
