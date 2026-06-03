"use client";

import Link from "next/link";
import { Archive, Edit } from "lucide-react";
import { KitPreset } from "@/lib/firebase/kitPresets";
import { isKitVisibleForSale } from "@/lib/data/kitPresets";

interface KitListProps {
  kits: KitPreset[];
  onArchive: (id: string) => Promise<void>;
  isMutating: boolean;
}

const pricingModeLabel = {
  fixed_price: "Preço fixo",
  sum_items: "Soma dos itens",
} as const;

export function KitList({ kits, onArchive, isMutating }: KitListProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <tr>
            <th className="px-6 py-4">Kit</th>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4">Itens</th>
            <th className="px-6 py-4">Preço</th>
            <th className="px-6 py-4">Flags</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {kits.map((kit) => (
            <tr
              key={kit.id}
              className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {kit.name}
                  </span>
                  <span className="text-xs text-zinc-500">{kit.slug}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="capitalize">{kit.kitType}</span>
              </td>
              <td className="px-6 py-4">
                {kit.items.length > 0
                  ? `${kit.items.length} item(ns)`
                  : kit.kitType === "customizable"
                    ? "Montagem livre"
                    : "Sem itens"}
              </td>
              <td className="px-6 py-4">
                {kit.pricingMode === "fixed_price" && kit.fixedPriceCents
                  ? `R$ ${(kit.fixedPriceCents / 100).toFixed(2)}`
                  : pricingModeLabel[kit.pricingMode]}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {kit.grantsFreeShipping && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Frete grátis
                    </span>
                  )}
                  {kit.isFeatured && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Destaque
                    </span>
                  )}
                  {kit.kitType === "customizable" && (
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
                      min {kit.minItems}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                {isKitVisibleForSale(kit) ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                    {kit.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/kits/${kit.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onArchive(kit.id)}
                    disabled={isMutating}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-red-600 hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-900/20"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
