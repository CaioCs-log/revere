import { AuditFields } from "../audit/auditFields";
import { ImageMode, ProductType } from "./products";

export type KitStatus = "draft" | "active" | "inactive" | "archived";
export type KitType = "fixed" | "suggested" | "customizable";
export type PricingMode = "sum_items" | "fixed_price";

export interface KitItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface DiscountTier {
  minItems: number;
  maxItems: number | null;
  discountPercent: number;
}

export interface KitPreset extends AuditFields {
  id: string;
  name: string;
  slug: string;
  status: KitStatus;
  shortDescription: string;
  description: string;
  imageId: string | null;
  imageAlt: string | null;
  imageMode: ImageMode;
  kitType: KitType;
  eligibleProductTypes: ProductType[];
  allowRepeatedItems: boolean;
  items: KitItem[];
  minItems: number;
  maxItems: number | null;
  pricingMode: PricingMode;
  fixedPriceCents: number | null;
  discountTiers: DiscountTier[];
  grantsFreeShipping: boolean;
  isFeatured: boolean;
  sortOrder: number;
}
