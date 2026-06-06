import type { SiteContentBlock } from "@/types/site-content"
import { Section } from "@/components/ui/Section"
import { Container } from "@/components/ui/Container"
import { Heading } from "@/components/ui/Heading"
import { Text } from "@/components/ui/Text"

type Step = {
  label: string
  description: string
}

type Props = {
  block: SiteContentBlock
}

export function HowItWorksSection({ block }: Props) {
  const steps = (block.metadata?.steps as Step[] | undefined) ?? []

  return (
    <Section variant="muted">
      <Container>
        {block.title && (
          <Heading level="2" className="text-center">
            {block.title}
          </Heading>
        )}
        {block.subtitle && (
          <Text className="mt-2 text-center">{block.subtitle}</Text>
        )}

        {steps.length > 0 && (
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-brand-accent text-surface-strong mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                  {index + 1}
                </div>
                <Heading level="3" className="mt-4 text-lg">
                  {step.label}
                </Heading>
                <Text className="mt-1 text-sm">{step.description}</Text>
              </div>
            ))}
          </div>
        )}

        {block.body && (
          <div className="mt-8 text-center">
            <Text>{block.body}</Text>
          </div>
        )}
      </Container>
    </Section>
  )
}
