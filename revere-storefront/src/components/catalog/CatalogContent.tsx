"use client"

import { Container } from "@/components/ui/Container"
import { Heading } from "@/components/ui/Heading"
import { Text } from "@/components/ui/Text"
import { Button } from "@/components/ui/Button"
import { ProductCard } from "@/components/ui/ProductCard"
import type { ProductWithPrice } from "@/lib/registry"
import type { Category } from "@/types/category"
import type { Tag } from "@/types/tag"

type CatalogContentProps = {
  products: ProductWithPrice[]
  categories: Category[]
  tags: Tag[]
  activeCategory: string | null
  activeTag: string | null
}

function buildFilterUrl(
  base: string,
  key: string,
  value: string | null,
  otherKey: string,
  otherValue: string | null
): string {
  const params = new URLSearchParams()
  if (value) params.set(key, value)
  if (otherValue && otherKey !== key) params.set(otherKey, otherValue)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function CatalogContent({
  products,
  categories,
  tags,
  activeCategory,
  activeTag,
}: CatalogContentProps) {
  const visibleTags = tags.filter((t) => t.showInFilters)

  return (
    <main>
      <section className="bg-surface-base px-6 py-16">
        <Container>
          <Heading level="1" className="text-center">
            Cardápio
          </Heading>
          <Text variant="muted" className="mt-2 text-center">
            Veja os pratos disponíveis essa semana.
          </Text>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button
              variant={activeCategory === null ? "primary" : "outline"}
              size="sm"
              href={buildFilterUrl(
                "/cardapio",
                "categoria",
                null,
                "tag",
                activeTag
              )}
            >
              Todas
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "primary" : "outline"}
                size="sm"
                href={buildFilterUrl(
                  "/cardapio",
                  "categoria",
                  activeCategory === cat.id ? null : cat.id,
                  "tag",
                  activeTag
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {visibleTags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {visibleTags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={activeTag === tag.id ? "primary" : "ghost"}
                  size="sm"
                  href={buildFilterUrl(
                    "/cardapio",
                    "tag",
                    activeTag === tag.id ? null : tag.id,
                    "categoria",
                    activeCategory
                  )}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          )}

          {products.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((entry) => (
                <ProductCard key={entry.product.id} product={entry} />
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <Text variant="muted" className="text-lg">
                Nenhum prato encontrado com esses filtros.
              </Text>
              <Button variant="outline" href="/cardapio" className="mt-4">
                Limpar filtros
              </Button>
            </div>
          )}
        </Container>
      </section>
    </main>
  )
}
