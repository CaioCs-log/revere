import { describe, expect, it } from "vitest"
import { MockRegistry } from "@/lib/registry"

describe("Catalog - product listing", () => {
  it("listPublicProducts returns 6 public products", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    expect(products).toHaveLength(6)
  })

  it("returns products sorted by sortOrder", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    const slugs = products.map((p) => p.product.slug)
    expect(slugs).toEqual([
      "frango-cremoso-com-pure-de-abobora",
      "escondidinho-funcional-de-carne",
      "bowl-proteico-de-frango",
      "sopa-low-carb-de-legumes",
      "lasanha-familia-de-frango-com-catupiry",
      "sobremesa-fit-de-cacau",
    ])
  })

  it("each product has price info", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    for (const entry of products) {
      expect(entry.lowestPriceCents).toBeGreaterThan(0)
      expect(entry.visibleVariants.length).toBeGreaterThan(0)
    }
  })
})

describe("Catalog - category filtering", () => {
  it("filters by category id", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    const pratos = products.filter((p) =>
      p.product.categoryIds.includes("cat_pratos")
    )
    expect(pratos).toHaveLength(5)
  })

  it("filters by a different category", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    const sopas = products.filter((p) =>
      p.product.categoryIds.includes("cat_sopas")
    )
    expect(sopas).toHaveLength(1)
    expect(sopas[0].product.slug).toBe("sopa-low-carb-de-legumes")
  })
})

describe("Catalog - tag filtering", () => {
  it("filters by tag id", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    const proteicos = products.filter((p) =>
      p.product.tagIds.includes("tag_proteico")
    )
    expect(proteicos).toHaveLength(4)
  })

  it("returns empty when category and tag combination has no matches", async () => {
    const registry = new MockRegistry()
    const products = await registry.listPublicProducts()
    const filtered = products.filter(
      (p) =>
        p.product.categoryIds.includes("cat_sopas") &&
        p.product.tagIds.includes("tag_proteico")
    )
    expect(filtered).toHaveLength(0)
  })
})

describe("Catalog - categories and tags", () => {
  it("listPublicCategories returns 3 active categories", async () => {
    const registry = new MockRegistry()
    const categories = await registry.listPublicCategories()
    expect(categories).toHaveLength(3)
    expect(categories.map((c) => c.slug)).toEqual(["pratos", "sopas", "kits"])
  })

  it("listPublicTags returns 6 active tags", async () => {
    const registry = new MockRegistry()
    const tags = await registry.listPublicTags()
    expect(tags).toHaveLength(6)
  })
})
