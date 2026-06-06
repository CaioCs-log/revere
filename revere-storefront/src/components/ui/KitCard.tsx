import type { KitPreset } from "@/types/kit"
import { Card } from "./Card"

type KitCardProps = {
  kit: KitPreset
}

export function KitCard({ kit }: KitCardProps) {
  const minDiscount =
    kit.discountTiers.length > 0 ? kit.discountTiers[0].discountPercent : null

  return (
    <Card variant="muted" href={`/kit/${kit.slug}`} className="p-6">
      <h3 className="group-hover:text-brand-700 text-xl font-semibold text-zinc-900">
        {kit.name}
      </h3>
      <p className="mt-2 text-sm text-zinc-600">{kit.shortDescription}</p>
      {minDiscount !== null && (
        <p className="text-brand-600 mt-3 text-sm font-medium">
          A partir de {kit.minItems} itens — ganhe {minDiscount}% off
        </p>
      )}
    </Card>
  )
}
