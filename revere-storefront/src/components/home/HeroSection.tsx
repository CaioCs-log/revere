import type { SiteContentBlock } from "@/types/site-content"
import { Container } from "@/components/ui/Container"
import { Button } from "@/components/ui/Button"
import { Heading } from "@/components/ui/Heading"
import { Text } from "@/components/ui/Text"
import Image from "next/image"

type Props = {
  block: SiteContentBlock
}

export function HeroSection({ block }: Props) {
  return (
    <section className="bg-surface-base relative px-6 py-24 sm:py-32">
      <Container variant="narrow" className="text-center">
        <Image
          src="/logo-wordmark-revere.svg"
          alt="Revere"
          width={240}
          height={72}
          className="mx-auto mb-8"
          style={{ width: "auto", height: "auto" }}
          priority
        />
        {block.title && (
          <Heading
            level="1"
            className="text-text-main text-4xl leading-tight font-bold tracking-tight sm:text-5xl"
          >
            {block.title}
          </Heading>
        )}
        {block.subtitle && (
          <Text
            variant="muted"
            className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl"
          >
            {block.subtitle}
          </Text>
        )}
        {block.ctaLabel && block.ctaHref && (
          <Button
            href={block.ctaHref}
            variant="primary"
            size="lg"
            className="mt-8"
          >
            {block.ctaLabel}
          </Button>
        )}
      </Container>
    </section>
  )
}
