import React from "react";
import Link from "next/link";
import { Product } from "@/lib/firebase/products";
import { BadgeCheck, EyeOff, Archive, Edit } from "lucide-react";

interface ProductListProps {
  products: Product[];
  onArchive: (id: string) => Promise<void>;
  isMutating: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onArchive,
  isMutating,
}) => {
  if (products.length === 0) {
    return null; // EmptyState will be handled by the page
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <tr>
            <th className="px-6 py-4">Produto</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Visibilidade</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {products.map((product) => (
            <tr
              key={product.id}
              className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {product.name}
                  </span>
                  <span className="text-xs text-zinc-500">{product.slug}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={product.status} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {product.isVisible ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <BadgeCheck className="h-4 w-4" />
                      Público
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <EyeOff className="h-4 w-4" />
                      Privado
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Link>
                  <button
                    onClick={() => onArchive(product.id)}
                    disabled={isMutating}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-red-600 transition-colors hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-900/20"
                  >
                    <Archive className="h-4 w-4" />
                    <span className="sr-only">Arquivar</span>
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

const StatusBadge = ({ status }: { status: Product["status"] }) => {
  const styles = {
    draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    active:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    inactive:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    archived: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const labels = {
    draft: "Rascunho",
    active: "Ativo",
    inactive: "Inativo",
    archived: "Arquivado",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};
