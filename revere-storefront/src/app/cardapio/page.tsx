import { getDefaultRegistry } from "@/lib/registry"
import { CatalogContent } from "@/components/catalog/CatalogContent"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; tag?: string }>
}) {
  const registry = getDefaultRegistry()
  const [allProducts, categories, tags] = await Promise.all([
    registry.listPublicProducts(),
    registry.listPublicCategories(),
    registry.listPublicTags(),
  ])

  const { categoria: activeCategory, tag: activeTag } = await searchParams

  const filtered = allProducts.filter((entry) => {
    if (activeCategory && !entry.product.categoryIds.includes(activeCategory))
      return false
    if (activeTag && !entry.product.tagIds.includes(activeTag)) return false
    return true
  })

  return (
    <CatalogContent
      products={filtered}
      categories={categories}
      tags={tags}
      activeCategory={activeCategory ?? null}
      activeTag={activeTag ?? null}
    />
  )
}
