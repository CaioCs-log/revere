import type { SiteContentBlock } from "@/types/site-content"
import { Section } from "@/components/ui/Section"
import { Container } from "@/components/ui/Container"
import { Heading } from "@/components/ui/Heading"
import { Text } from "@/components/ui/Text"
import { Button } from "@/components/ui/Button"

type Props = {
  block: SiteContentBlock
}

export function FinalCtaSection({ block }: Props) {
  const signature = block.metadata?.signature as string | undefined

  return (
    <Section variant="brand">
      <Container variant="narrow" className="text-center">
        {block.title && (
          <Heading level="2" className="text-white">
            {block.title}
          </Heading>
        )}
        {block.subtitle && (
          <Text variant="body" className="text-brand-100 mt-4 text-lg">
            {block.subtitle}
          </Text>
        )}
        {block.ctaLabel && block.ctaHref && (
          <Button variant="secondary" href={block.ctaHref} className="mt-8">
            {block.ctaLabel}
          </Button>
        )}
        {signature && (
          <Text
            variant="caption"
            className="text-brand-200 font-display mt-12 text-2xl font-bold tracking-widest"
          >
            {signature}
          </Text>
        )}
      </Container>
    </Section>
  )
}
