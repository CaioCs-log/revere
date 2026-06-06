import { describe, expect, it } from "vitest"
import { MockRegistry } from "@/lib/registry"
import { formatPriceCents } from "@/lib/format"

describe("Product detail - registry lookup", () => {
  it("returns product data for an existing slug", async () => {
    const registry = new MockRegistry()
    const product = await registry.getPublicProductBySlug(
      "frango-cremoso-com-pure-de-abobora"
    )
    expect(product).not.toBeNull()
    expect(product!.product.name).toBe("Frango cremoso com pure de abobora")
    expect(product!.visibleVariants.length).toBeGreaterThan(0)
  })

  it("returns null for a non-existent slug", async () => {
    const registry = new MockRegistry()
    const product = await registry.getPublicProductBySlug("prato-inexistente")
    expect(product).toBeNull()
  })

  it("returns null for a non-public product slug", async () => {
    const registry = new MockRegistry()
    const product = await registry.getPublicProductBySlug(
      "borrachinha-sabor-morango"
    )
    expect(product).toBeNull()
  })

  it("returns variants with correct pricing", async () => {
    const registry = new MockRegistry()
    const product = await registry.getPublicProductBySlug(
      "frango-cremoso-com-pure-de-abobora"
    )
    expect(product!.lowestPriceCents).toBe(2890)
    expect(product!.visibleVariants[0].priceCents).toBe(2890)
    expect(product!.visibleVariants[1].priceCents).toBe(3290)
  })

  it("returns product with ingredients", async () => {
    const registry = new MockRegistry()
    const product = await registry.getPublicProductBySlug(
      "bowl-proteico-de-frango"
    )
    expect(product!.product.ingredients).toContain("Peito de frango")
    expect(product!.product.ingredients).toContain("Quinoa")
  })
})

describe("formatPriceCents", () => {
  it("formats 2890 as R$ 28,90", () => {
    expect(formatPriceCents(2890)).toBe("R$ 28,90")
  })

  it("formats 3250 as R$ 32,50", () => {
    expect(formatPriceCents(3250)).toBe("R$ 32,50")
  })
})
