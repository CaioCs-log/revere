"use client";

import React from "react";
import Link from "next/link";
import { ProductVariant } from "@/lib/firebase/productVariants";
import { Archive, Edit } from "lucide-react";

interface VariantListProps {
  variants: ProductVariant[];
  onArchive: (id: string) => Promise<void>;
  isMutating: boolean;
}

export const VariantList: React.FC<VariantListProps> = ({
  variants,
  onArchive,
  isMutating,
}) => {
  if (variants.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <tr>
            <th className="px-6 py-4">Variante</th>
            <th className="px-6 py-4">Produto</th>
            <th className="px-6 py-4">SKU</th>
            <th className="px-6 py-4">Porção / Peso</th>
            <th className="px-6 py-4">Preço</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {variants.map((v) => (
            <tr
              key={v.id}
              className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {v.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-zinc-600">{v.productId}</div>
              </td>
              <td className="px-6 py-4">{v.sku}</td>
              <td className="px-6 py-4">
                {v.portionLabel} / {v.weightGrams}g
              </td>
              <td className="px-6 py-4">
                R$ {(v.priceCents / 100).toFixed(2)}
              </td>
              <td className="px-6 py-4">{v.status}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/variants/${v.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onArchive(v.id)}
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
};

export default VariantList;
