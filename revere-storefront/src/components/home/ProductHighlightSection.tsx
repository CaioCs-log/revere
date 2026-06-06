import type { SiteContentBlock } from "@/types/site-content"
import type { ProductWithPrice } from "@/lib/registry"
import { Section } from "@/components/ui/Section"
import { Container } from "@/components/ui/Container"
import { Heading } from "@/components/ui/Heading"
import { Text } from "@/components/ui/Text"
import { Button } from "@/components/ui/Button"
import { ProductCard } from "@/components/ui/ProductCard"

type Props = {
  block: SiteContentBlock
  products: ProductWithPrice[]
}

export function ProductHighlightSection({ block, products }: Props) {
  return (
    <Section variant="muted">
      <Container>
        {block.title && (
          <Heading level="2" className="text-center">
            {block.title}
          </Heading>
        )}
        {block.subtitle && (
          <Text variant="muted" className="mt-2 text-center">
            {block.subtitle}
          </Text>
        )}

        {products.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((entry) => (
              <ProductCard key={entry.product.id} product={entry} />
            ))}
          </div>
        )}

        {block.ctaLabel && block.ctaHref && (
          <div className="mt-10 text-center">
            <Button variant="outline" href={block.ctaHref}>
              {block.ctaLabel}
            </Button>
          </div>
        )}
      </Container>
    </Section>
  )
}
