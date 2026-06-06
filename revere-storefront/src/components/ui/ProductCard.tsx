import type { ProductWithPrice } from "@/lib/registry"
import { Card } from "./Card"
import { formatPriceCents } from "@/lib/format"

type ProductCardProps = {
  product: ProductWithPrice
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card href={`/produto/${product.product.slug}`} className="p-5">
      <div className="aspect-[4/3] rounded-lg bg-zinc-100" />
      <h3 className="group-hover:text-brand-700 mt-4 text-lg font-semibold text-zinc-900">
        {product.product.name}
      </h3>
      <p className="mt-1 text-sm text-zinc-600">
        {product.product.shortDescription}
      </p>
      {product.lowestPriceCents !== null && (
        <p className="text-brand-700 mt-3 text-lg font-bold">
          a partir de {formatPriceCents(product.lowestPriceCents)}
        </p>
      )}
    </Card>
  )
}
