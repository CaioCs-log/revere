import type { SiteContentBlock } from "@/types/site-content"
import type { KitPreset } from "@/types/kit"
import { Section } from "@/components/ui/Section"
import { Container } from "@/components/ui/Container"
import { Heading } from "@/components/ui/Heading"
import { Text } from "@/components/ui/Text"
import { Button } from "@/components/ui/Button"
import { KitCard } from "@/components/ui/KitCard"

type Props = {
  block: SiteContentBlock
  kits: KitPreset[]
}

export function KitHighlightSection({ block, kits }: Props) {
  return (
    <Section>
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

        {kits.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {kits.map((kit) => (
              <KitCard key={kit.id} kit={kit} />
            ))}
          </div>
        )}

        {block.ctaLabel && block.ctaHref && (
          <div className="mt-10 text-center">
            <Button href={block.ctaHref}>{block.ctaLabel}</Button>
          </div>
        )}
      </Container>
    </Section>
  )
}
