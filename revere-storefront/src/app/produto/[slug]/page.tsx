import { getDefaultRegistry } from "@/lib/registry"
import { Container } from "@/components/ui/Container"
import { Heading } from "@/components/ui/Heading"
import { Text } from "@/components/ui/Text"
import { Button } from "@/components/ui/Button"
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder"
import { formatPriceCents } from "@/lib/format"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const registry = getDefaultRegistry()
  const productData = await registry.getPublicProductBySlug(slug)

  if (!productData) {
    return (
      <main>
        <section className="bg-surface-base px-6 py-24">
          <Container variant="narrow" className="text-center">
            <Heading level="1">Prato não encontrado</Heading>
            <Text className="text-text-muted mx-auto mt-4 max-w-md">
              O prato que você está procurando não está disponível ou não
              existe.
            </Text>
            <Button href="/cardapio" className="mt-8">
              Ver cardápio
            </Button>
          </Container>
        </section>
      </main>
    )
  }

  const { product, visibleVariants } = productData

  return (
    <main>
      <section className="bg-surface-base px-6 py-16">
        <Container variant="narrow">
          <Button variant="ghost" href="/cardapio" className="mb-8">
            &larr; Voltar ao cardápio
          </Button>

          <ImagePlaceholder className="mb-8" />

          <Heading level="1">{product.name}</Heading>

          {product.shortDescription && (
            <Text variant="muted" className="mt-2 text-lg">
              {product.shortDescription}
            </Text>
          )}

          {product.description && (
            <Text className="mt-6">{product.description}</Text>
          )}

          {product.ingredients.length > 0 && (
            <div className="mt-8">
              <Heading level="2" variant="card">
                Ingredientes
              </Heading>
              <ul className="text-text-muted mt-3 list-inside list-disc space-y-1">
                {product.ingredients.map((ingredient, i) => (
                  <li key={i}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {visibleVariants.length > 0 && (
            <div className="mt-8">
              <Heading level="2" variant="card">
                Porções disponíveis
              </Heading>
              <div className="mt-3 space-y-3">
                {visibleVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
                  >
                    <div>
                      <Text className="font-semibold">
                        {variant.portionLabel}
                      </Text>
                      {variant.compareAtPriceCents &&
                        variant.compareAtPriceCents > variant.priceCents && (
                          <Text variant="caption" className="line-through">
                            {formatPriceCents(variant.compareAtPriceCents)}
                          </Text>
                        )}
                    </div>
                    <Text className="text-brand-700 text-xl font-bold">
                      {formatPriceCents(variant.priceCents)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.storageInstructions && (
            <div className="mt-8">
              <Heading level="2" variant="card">
                Armazenamento
              </Heading>
              <Text className="mt-1">{product.storageInstructions}</Text>
            </div>
          )}

          {product.consumptionInstructions && (
            <div className="mt-4">
              <Heading level="2" variant="card">
                Modo de preparo
              </Heading>
              <Text className="mt-1">{product.consumptionInstructions}</Text>
            </div>
          )}

          {product.allergens.length > 0 && (
            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <Text className="font-semibold text-amber-800">
                Alérgenos: {product.allergens.join(", ")}
              </Text>
            </div>
          )}
        </Container>
      </section>
    </main>
  )
}
