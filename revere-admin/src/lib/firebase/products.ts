import { AuditFields } from "../audit/auditFields";

export type ProductStatus = "draft" | "active" | "inactive" | "archived";
export type ImageMode =
  | "real_photo"
  | "brand_placeholder"
  | "editorial"
  | "illustration";
export type ProductType = "frozen_meal" | "frozen_snack" | "other";

export interface Product extends AuditFields {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  isVisible: boolean;
  productType: ProductType;
  categoryIds: string[];
  tagIds: string[];
  imageIds: string[];
  mainImageId: string | null;
  mainImageAlt: string | null;
  imageMode: ImageMode;
  ingredients: string[];
  allergens: string[];
  nutritionalHighlights: string[];
  storageInstructions: string;
  consumptionInstructions: string;
  isFeatured: boolean;
  isNew: boolean;
  sortOrder: number;
}
