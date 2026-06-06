import { getDefaultRegistry } from "@/lib/registry"
import { HeroSection } from "./HeroSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { ProductHighlightSection } from "./ProductHighlightSection"
import { KitHighlightSection } from "./KitHighlightSection"
import { DeliveryInfoSection } from "./DeliveryInfoSection"
import { FinalCtaSection } from "./FinalCtaSection"
import { TrustBlock } from "@/components/ui/TrustBlock"
import type { Pillar, SiteContentBlock } from "@/types/site-content"

export async function HomeSections() {
  const registry = getDefaultRegistry()
  const [blocks, products, kits] = await Promise.all([
    registry.listPublishedSiteContent(),
    registry.listPublicProducts(),
    registry.listPublicKits(),
  ])

  const productMap = new Map(products.map((p) => [p.product.id, p]))
  const kitMap = new Map(kits.map((k) => [k.id, k]))

  return (
    <>
      {blocks.map((block: SiteContentBlock) => {
        switch (block.type) {
          case "home_hero":
            return <HeroSection key={block.id} block={block} />
          case "home_how_it_works":
            return <HowItWorksSection key={block.id} block={block} />
          case "home_product_highlight": {
            const highlighted = block.linkedProductIds
              .map((id) => productMap.get(id))
              .filter((p): p is NonNullable<typeof p> => p !== undefined)
            return (
              <ProductHighlightSection
                key={block.id}
                block={block}
                products={highlighted}
              />
            )
          }
          case "home_kit_highlight": {
            const highlighted = block.linkedKitPresetIds
              .map((id) => kitMap.get(id))
              .filter((k): k is NonNullable<typeof k> => k !== undefined)
            return (
              <KitHighlightSection
                key={block.id}
                block={block}
                kits={highlighted}
              />
            )
          }
          case "delivery_info":
            return <DeliveryInfoSection key={block.id} block={block} />
          case "social_proof":
            const pillars =
              (block.metadata as { pillars?: Pillar[] }).pillars ?? []
            return <TrustBlock key={block.id} pillars={pillars} />
          case "final_cta":
            return <FinalCtaSection key={block.id} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
