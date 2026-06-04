import type { Category } from "@/types/category"
import { isPublicCategory } from "@/types/category"
import { isPublicKit, type KitPreset } from "@/types/kit"
import { isPublicProduct, type Product } from "@/types/product"
import {
  isPublishedSiteContent,
  type SiteContentBlock,
} from "@/types/site-content"
import { isPublicTag, type Tag } from "@/types/tag"
import { isPublicVariant, type ProductVariant } from "@/types/variant"

import { mockCategories } from "@/data/mocks/categories"
import { mockKits } from "@/data/mocks/kits"
import { mockProducts } from "@/data/mocks/products"
import { mockSiteContent } from "@/data/mocks/site-content"
import { mockTags } from "@/data/mocks/tags"
import { mockProductVariants } from "@/data/mocks/variants"

export type ProductWithPrice = {
  product: Product
  lowestPriceCents: number | null
  visibleVariants: ProductVariant[]
}

export type DataRegistry = {
  listPublicProducts(): Promise<ProductWithPrice[]>
  getPublicProductBySlug(slug: string): Promise<ProductWithPrice | null>
  listPublicCategories(): Promise<Category[]>
  listPublicTags(): Promise<Tag[]>
  listPublicKits(): Promise<KitPreset[]>
  getPublicKitBySlug(slug: string): Promise<KitPreset | null>
  listPublishedSiteContent(): Promise<SiteContentBlock[]>
  getLowestPriceCents(productId: string): Promise<number | null>
}

function sortBySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

function sortByPriority<T extends { displayRules: { priority: number } }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => a.displayRules.priority - b.displayRules.priority
  )
}

export class MockRegistry implements DataRegistry {
  private readonly products: Product[]
  private readonly variants: ProductVariant[]
  private readonly categories: Category[]
  private readonly tags: Tag[]
  private readonly kits: KitPreset[]
  private readonly siteContent: SiteContentBlock[]

  constructor(
    options: {
      products?: Product[]
      variants?: ProductVariant[]
      categories?: Category[]
      tags?: Tag[]
      kits?: KitPreset[]
      siteContent?: SiteContentBlock[]
      now?: () => Date
    } = {}
  ) {
    this.products = options.products ?? mockProducts
    this.variants = options.variants ?? mockProductVariants
    this.categories = options.categories ?? mockCategories
    this.tags = options.tags ?? mockTags
    this.kits = options.kits ?? mockKits
    this.siteContent = options.siteContent ?? mockSiteContent
    this.now = options.now ?? (() => new Date())
  }

  private readonly now: () => Date

  getVisibleVariantsForProduct(productId: string): ProductVariant[] {
    return this.variants.filter(
      (variant) => variant.productId === productId && isPublicVariant(variant)
    )
  }

  computeLowestPriceCents(productId: string): number | null {
    const visible = this.getVisibleVariantsForProduct(productId)
    if (visible.length === 0) return null
    return visible.reduce(
      (min, variant) => Math.min(min, variant.priceCents),
      Number.POSITIVE_INFINITY
    )
  }

  hasPurchasableVariant(productId: string): boolean {
    return this.getVisibleVariantsForProduct(productId).length > 0
  }

  buildProductWithPrice(product: Product): ProductWithPrice {
    const visibleVariants = this.getVisibleVariantsForProduct(product.id)
    const lowestPriceCents =
      visibleVariants.length === 0
        ? null
        : visibleVariants.reduce(
            (min, variant) => Math.min(min, variant.priceCents),
            Number.POSITIVE_INFINITY
          )

    return {
      product,
      lowestPriceCents:
        lowestPriceCents === Number.POSITIVE_INFINITY ? null : lowestPriceCents,
      visibleVariants,
    }
  }

  async listPublicProducts(): Promise<ProductWithPrice[]> {
    const result: ProductWithPrice[] = []
    for (const product of this.products) {
      if (!isPublicProduct(product)) continue
      if (!this.hasPurchasableVariant(product.id)) continue
      result.push(this.buildProductWithPrice(product))
    }
    return result.sort((a, b) => a.product.sortOrder - b.product.sortOrder)
  }

  async getPublicProductBySlug(slug: string): Promise<ProductWithPrice | null> {
    const product = this.products.find((item) => item.slug === slug)
    if (!product) return null
    if (!isPublicProduct(product)) return null
    if (!this.hasPurchasableVariant(product.id)) return null
    return this.buildProductWithPrice(product)
  }

  async listPublicCategories(): Promise<Category[]> {
    return sortBySortOrder(
      this.categories.filter((category) => isPublicCategory(category))
    )
  }

  async listPublicTags(): Promise<Tag[]> {
    return sortBySortOrder(this.tags.filter((tag) => isPublicTag(tag)))
  }

  async listPublicKits(): Promise<KitPreset[]> {
    return sortBySortOrder(this.kits.filter((kit) => isPublicKit(kit)))
  }

  async getPublicKitBySlug(slug: string): Promise<KitPreset | null> {
    const kit = this.kits.find((item) => item.slug === slug)
    if (!kit) return null
    if (!isPublicKit(kit)) return null
    return kit
  }

  async listPublishedSiteContent(): Promise<SiteContentBlock[]> {
    const now = this.now()
    return sortByPriority(
      this.siteContent.filter((block) => isPublishedSiteContent(block, now))
    )
  }

  async getLowestPriceCents(productId: string): Promise<number | null> {
    return this.computeLowestPriceCents(productId)
  }
}

let defaultRegistry: DataRegistry | null = null

export function getDefaultRegistry(): DataRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new MockRegistry()
  }
  return defaultRegistry
}
