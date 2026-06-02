import { AuditFields } from "../audit/auditFields";

export type VariantStatus = "draft" | "active" | "inactive" | "archived";

export interface ProductVariant extends AuditFields {
  id: string;
  productId: string;
  name: string;
  sku: string;
  status: VariantStatus;
  portionLabel: string;
  weightGrams: number;
  priceCents: number;
  compareAtPriceCents: number | null;
  isVisible: boolean;
  minQuantity: number;
  maxQuantity: number | null;
  isDefault: boolean;
  sortOrder: number;
}
