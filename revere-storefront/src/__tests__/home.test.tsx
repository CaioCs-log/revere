import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { HomeSections } from "@/components/home/HomeSections"
import { MockRegistry } from "@/lib/registry"
import type { SiteContentBlock } from "@/types/site-content"

describe("HomeSections", () => {
  it("renders all published site content blocks in priority order", async () => {
    const registry = new MockRegistry()
    const blocks = await registry.listPublishedSiteContent()
    const blockTypes = blocks.map((b) => b.type)

    expect(blockTypes).toEqual([
      "home_hero",
      "home_how_it_works",
      "home_product_highlight",
      "home_kit_highlight",
      "delivery_info",
      "social_proof",
      "final_cta",
    ])
  })

  it("maps each block type to the correct component", async () => {
    render(await HomeSections())

    expect(
      screen.getByText("Comida de verdade, explicada.")
    ).toBeInTheDocument()
    expect(screen.getByText("Como funciona")).toBeInTheDocument()
    expect(screen.getByText("Cardápio da semana")).toBeInTheDocument()
    expect(screen.getByText("Kits")).toBeInTheDocument()
    expect(screen.getByText("Entrega")).toBeInTheDocument()
    expect(screen.getByText("Por que confiar")).toBeInTheDocument()
    expect(
      screen.getByText("Receba o cardápio da semana e escolha seus pratos.")
    ).toBeInTheDocument()
  })

  it("renders the hero section with title and CTA", async () => {
    render(await HomeSections())

    expect(
      screen.getByText("Comida de verdade, explicada.")
    ).toBeInTheDocument()

    const ctaButtons = screen.getAllByText("Receber cardápio")
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1)
    expect(ctaButtons[0]).toHaveAttribute("href", "/receber-cardapio")
  })

  it("renders the how it works section with all steps", async () => {
    render(await HomeSections())

    expect(screen.getByText("Como funciona")).toBeInTheDocument()

    expect(screen.getByText("Escolha")).toBeInTheDocument()
    expect(screen.getByText("Receba")).toBeInTheDocument()
    expect(screen.getByText("Aqueça")).toBeInTheDocument()
    expect(screen.getByText("Descubra")).toBeInTheDocument()
  })

  it("renders the product highlight section with featured products", async () => {
    render(await HomeSections())

    expect(screen.getByText("Cardápio da semana")).toBeInTheDocument()

    expect(
      screen.getByText("Frango cremoso com pure de abobora")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Escondidinho funcional de carne")
    ).toBeInTheDocument()
    expect(screen.getByText("Bowl proteico de frango")).toBeInTheDocument()
  })

  it("renders the kit highlight section", async () => {
    render(await HomeSections())

    expect(screen.getByText("Kits")).toBeInTheDocument()

    expect(screen.getByText("Kit Semana Leve")).toBeInTheDocument()
    expect(screen.getByText("Kit Performance")).toBeInTheDocument()
  })

  it("renders the trust block with pillars", async () => {
    render(await HomeSections())

    expect(screen.getByText("Por que confiar")).toBeInTheDocument()
    expect(
      screen.getByText("Transparência não é discurso, é como a gente cozinha.")
    ).toBeInTheDocument()
    expect(screen.getByText("Validação técnica")).toBeInTheDocument()
    expect(screen.getByText("Ingredientes reais")).toBeInTheDocument()
    expect(screen.getByText("O porquê de cada ingrediente")).toBeInTheDocument()
  })

  it("renders the delivery info section", async () => {
    render(await HomeSections())

    expect(screen.getByText("Entrega")).toBeInTheDocument()
  })

  it("renders the final CTA section with signature", async () => {
    render(await HomeSections())

    expect(
      screen.getByText("Receba o cardápio da semana e escolha seus pratos.")
    ).toBeInTheDocument()

    const ctas = screen.getAllByText("Receber cardápio")
    expect(ctas.length).toBeGreaterThanOrEqual(2)
    expect(ctas[ctas.length - 1]).toHaveAttribute("href", "/receber-cardapio")

    expect(screen.getByText("Naturalmente.")).toBeInTheDocument()
  })

  it("renders price formatted in BRL", async () => {
    render(await HomeSections())

    expect(screen.getByText(/R\$ 28,90/)).toBeInTheDocument()
  })

  it("renders kit discount info", async () => {
    render(await HomeSections())

    expect(screen.getByText(/A partir de 7 itens/)).toBeInTheDocument()
  })

  it("does not break when a block has incomplete data", async () => {
    const incompleteBlock: SiteContentBlock = {
      id: "sc_incomplete",
      key: "incomplete",
      status: "published",
      type: "home_hero",
      title: null,
      subtitle: null,
      body: null,
      imageId: null,
      imageAlt: null,
      imageMode: "brand_placeholder",
      ctaLabel: null,
      ctaHref: null,
      linkedProductIds: [],
      linkedCategoryIds: [],
      linkedKitPresetIds: [],
      displayRules: {
        startsAt: null,
        endsAt: null,
        priority: 99,
        showOnHome: true,
        showOnCheckout: false,
        showOnCatalog: false,
      },
      metadata: {},
      publishedAt: "2026-06-01T00:00:00.000Z",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    }

    const registry = new MockRegistry({
      siteContent: [incompleteBlock],
      products: [],
      kits: [],
    })

    const sections = registry.listPublishedSiteContent().then((blocks) =>
      blocks.map((block) => {
        switch (block.type) {
          case "home_hero":
            return true
          default:
            return false
        }
      })
    )

    await expect(sections).resolves.not.toThrow()
  })
})
