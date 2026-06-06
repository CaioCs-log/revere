import type { SiteContentBlock } from "@/types/site-content"
import { Section } from "@/components/ui/Section"
import { Container } from "@/components/ui/Container"
import { DeliveryNotice } from "@/components/ui/DeliveryNotice"

type Props = {
  block: SiteContentBlock
}

export function DeliveryInfoSection({ block }: Props) {
  return (
    <Section variant="muted">
      <Container variant="narrow">
        <DeliveryNotice
          title={block.title}
          subtitle={block.subtitle}
          body={block.body}
        />
      </Container>
    </Section>
  )
}
