export type ProductVariantStatus = "draft" | "active" | "inactive" | "archived"

export type ProductVariant = {
  id: string
  productId: string
  name: string
  sku: string
  status: ProductVariantStatus
  portionLabel: string
  weightGrams: number
  priceCents: number
  compareAtPriceCents: number | null
  isVisible: boolean
  minQuantity: number
  maxQuantity: number | null
  isDefault: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function isPublicVariant(variant: ProductVariant): boolean {
  return variant.status === "active" && variant.isVisible
}
