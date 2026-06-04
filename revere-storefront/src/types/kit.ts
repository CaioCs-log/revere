import type { ImageMode, ProductType } from "./product"

export type KitType = "fixed" | "suggested" | "customizable"

export type KitPricingMode = "sum_items" | "fixed_price"

export type KitItem = {
  productId: string
  variantId: string
  quantity: number
}

export type KitDiscountTier = {
  minItems: number
  maxItems: number | null
  discountPercent: number
}

export type KitStatus = "draft" | "active" | "inactive" | "archived"

export type KitPreset = {
  id: string
  name: string
  slug: string
  status: KitStatus
  shortDescription: string
  description: string
  imageId: string | null
  imageAlt: string | null
  imageMode: ImageMode
  kitType: KitType
  eligibleProductTypes: ProductType[]
  allowRepeatedItems: boolean
  items: KitItem[]
  minItems: number
  maxItems: number | null
  pricingMode: KitPricingMode
  fixedPriceCents: number | null
  discountTiers: KitDiscountTier[]
  grantsFreeShipping: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function isPublicKit(kit: KitPreset): boolean {
  return kit.status === "active"
}
