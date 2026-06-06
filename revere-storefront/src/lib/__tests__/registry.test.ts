import { describe, expect, it } from "vitest"

import { MockRegistry, getDefaultRegistry } from "@/lib/registry"
import { mockKits } from "@/data/mocks/kits"
import { mockProducts } from "@/data/mocks/products"
import { mockProductVariants } from "@/data/mocks/variants"
import { mockSiteContent } from "@/data/mocks/site-content"
import type { Product } from "@/types/product"
import type { ProductVariant } from "@/types/variant"

describe("MockRegistry - products", () => {
  it("listPublicProducts excludes draft, inactive, archived and invisible products", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    const ids = products.map((entry) => entry.product.id)

    expect(ids).toContain("prod_frango_cremoso")
    expect(ids).toContain("prod_escondidinho_funcional")
    expect(ids).toContain("prod_bowl_proteico")
    expect(ids).toContain("prod_sopa_low_carb")
    expect(ids).toContain("prod_lasanha_familia")
    expect(ids).toContain("prod_sobremesa_fit")

    expect(ids).not.toContain("prod_borrachinha_sabor")
    expect(ids).not.toContain("prod_escondidinho_arquivado")
    expect(ids).not.toContain("prod_lasanha_oculta")
  })

  it("listPublicProducts returns products ordered by sortOrder", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    const order = products.map((entry) => entry.product.sortOrder)
    const sorted = [...order].sort((a, b) => a - b)
    expect(order).toEqual(sorted)
  })

  it("getPublicProductBySlug returns null for unknown slugs", async () => {
    const registry = new MockRegistry()
    await expect(
      registry.getPublicProductBySlug("nao-existe")
    ).resolves.toBeNull()
  })

  it("getPublicProductBySlug returns null for non-public slugs", async () => {
    const registry = new MockRegistry()
    await expect(
      registry.getPublicProductBySlug("borrachinha-sabor-morango")
    ).resolves.toBeNull()
  })
})

describe("MockRegistry - lowest price", () => {
  it("considers only active and isVisible variants when computing lowest price", async () => {
    const variants: ProductVariant[] = [
      {
        id: "v_a",
        productId: "prod_x",
        name: "Invisible cheap",
        sku: "X-INV",
        status: "active",
        portionLabel: "100g",
        weightGrams: 100,
        priceCents: 100,
        compareAtPriceCents: null,
        isVisible: false,
        minQuantity: 1,
        maxQuantity: null,
        isDefault: false,
        sortOrder: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "v_b",
        productId: "prod_x",
        name: "Inactive cheap",
        sku: "X-INA",
        status: "inactive",
        portionLabel: "100g",
        weightGrams: 100,
        priceCents: 200,
        compareAtPriceCents: null,
        isVisible: true,
        minQuantity: 1,
        maxQuantity: null,
        isDefault: false,
        sortOrder: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "v_c",
        productId: "prod_x",
        name: "Public medium",
        sku: "X-PUB",
        status: "active",
        portionLabel: "200g",
        weightGrams: 200,
        priceCents: 500,
        compareAtPriceCents: null,
        isVisible: true,
        minQuantity: 1,
        maxQuantity: null,
        isDefault: true,
        sortOrder: 3,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "v_d",
        productId: "prod_x",
        name: "Public expensive",
        sku: "X-PUB2",
        status: "active",
        portionLabel: "300g",
        weightGrams: 300,
        priceCents: 900,
        compareAtPriceCents: null,
        isVisible: true,
        minQuantity: 1,
        maxQuantity: null,
        isDefault: false,
        sortOrder: 4,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]

    const product: Product = {
      id: "prod_x",
      name: "Produto X",
      slug: "produto-x",
      shortDescription: "x",
      description: "x",
      status: "active",
      isVisible: true,
      productType: "frozen_meal",
      categoryIds: ["cat_pratos"],
      tagIds: [],
      imageIds: [],
      mainImageId: null,
      mainImageAlt: null,
      imageMode: "brand_placeholder",
      ingredients: [],
      allergens: [],
      nutritionalHighlights: [],
      storageInstructions: "x",
      consumptionInstructions: "x",
      isFeatured: false,
      isNew: false,
      sortOrder: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }

    const registry = new MockRegistry({
      products: [product],
      variants,
    })

    const lowest = await registry.getLowestPriceCents("prod_x")
    expect(lowest).toBe(500)
  })

  it("returns null when a product has no active and visible variants", async () => {
    const variants: ProductVariant[] = [
      {
        id: "v_only",
        productId: "prod_y",
        name: "Hidden",
        sku: "Y-HID",
        status: "active",
        portionLabel: "100g",
        weightGrams: 100,
        priceCents: 999,
        compareAtPriceCents: null,
        isVisible: false,
        minQuantity: 1,
        maxQuantity: null,
        isDefault: true,
        sortOrder: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]
    const registry = new MockRegistry({ variants })
    await expect(registry.getLowestPriceCents("prod_y")).resolves.toBeNull()
  })
})

describe("MockRegistry - kits", () => {
  it("listPublicKits returns only active kits", async () => {
    const registry = new MockRegistry()
    const kits = await registry.listPublicKits()
    const ids = kits.map((kit) => kit.id)
    expect(ids).toContain("kit_semana_leve")
    expect(ids).toContain("kit_performance")
    expect(ids).not.toContain("kit_familia")
  })

  it("mocked customizable kits contain the 5/8/10 discount tiers", () => {
    const customizableKits = mockKits.filter(
      (kit) => kit.kitType === "customizable"
    )
    expect(customizableKits.length).toBeGreaterThanOrEqual(2)
    for (const kit of customizableKits) {
      const percents = kit.discountTiers
        .map((tier) => tier.discountPercent)
        .sort((a, b) => a - b)
      expect(percents).toEqual([5, 8, 10])
    }
  })

  it("getPublicKitBySlug returns null for non-public kits", async () => {
    const registry = new MockRegistry()
    await expect(registry.getPublicKitBySlug("kit-familia")).resolves.toBeNull()
  })
})

describe("MockRegistry - categories and tags", () => {
  it("listPublicCategories excludes inactive categories", async () => {
    const registry = new MockRegistry()
    const categories = await registry.listPublicCategories()
    const slugs = categories.map((c) => c.slug)
    expect(slugs).toContain("pratos")
    expect(slugs).toContain("sopas")
    expect(slugs).toContain("kits")
    expect(slugs).not.toContain("linha-leve")
  })

  it("listPublicTags returns only active tags", async () => {
    const registry = new MockRegistry()
    const tags = await registry.listPublicTags()
    const slugs = tags.map((t) => t.slug)
    expect(slugs).toContain("proteico")
    expect(slugs).toContain("low-carb")
    expect(slugs).toContain("sem-gluten")
    expect(slugs).toContain("sem-lactose")
    expect(slugs).toContain("mais-vendido")
    expect(slugs).toContain("novo")
  })
})

describe("MockRegistry - siteContent", () => {
  it("listPublishedSiteContent returns published blocks ordered by priority", async () => {
    const fixedNow = new Date("2026-06-01T00:00:00.000Z")
    const registry = new MockRegistry({ now: () => fixedNow })
    const blocks = await registry.listPublishedSiteContent()
    const keys = blocks.map((block) => block.key)
    expect(keys).toEqual([
      "home_hero",
      "home_how_it_works",
      "home_product_highlight",
      "home_kit_highlight",
      "delivery_info",
      "trust_block",
      "final_cta",
    ])

    const priorities = blocks.map((b) => b.displayRules.priority)
    const sorted = [...priorities].sort((a, b) => a - b)
    expect(priorities).toEqual(sorted)
  })

  it("listPublishedSiteContent excludes draft blocks", async () => {
    const fixedNow = new Date("2026-06-01T00:00:00.000Z")
    const registry = new MockRegistry({ now: () => fixedNow })
    const blocks = await registry.listPublishedSiteContent()
    expect(blocks.find((b) => b.key === "home_hero_draft")).toBeUndefined()
  })

  it("mock site content has the required 7 home blocks", () => {
    const requiredKeys = [
      "home_hero",
      "home_how_it_works",
      "home_product_highlight",
      "home_kit_highlight",
      "delivery_info",
      "trust_block",
      "final_cta",
    ]
    for (const key of requiredKeys) {
      expect(
        mockSiteContent.find((block) => block.key === key),
        `expected mock site content to include block ${key}`
      ).toBeDefined()
    }
  })
})

describe("MockRegistry - mock datasets", () => {
  it("exposes at least 5 products, 5 variants, 3 categories, 5 tags, 2 kits", () => {
    expect(mockProducts.length).toBeGreaterThanOrEqual(5)
    expect(mockProductVariants.length).toBeGreaterThanOrEqual(5)
    expect(mockKits.length).toBeGreaterThanOrEqual(2)
  })
})

describe("getDefaultRegistry", () => {
  it("returns a singleton-style registry", () => {
    const a = getDefaultRegistry()
    const b = getDefaultRegistry()
    expect(a).toBe(b)
  })
})
