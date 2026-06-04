"use client";

import Link from "next/link";
import { Archive, CheckCircle, Edit, Eye, EyeOff, XCircle } from "lucide-react";
import { SiteContent, SiteContentStatus } from "@/lib/firebase/siteContent";

interface SiteContentListProps {
  items: SiteContent[];
  onStatusChange: (id: string, status: SiteContentStatus) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  isMutating: boolean;
}

const typeLabels: Record<string, string> = {
  home_hero: "Hero da Home",
  home_how_it_works: "Como Funciona",
  home_product_highlight: "Destaque de Produto",
  home_kit_highlight: "Destaque de Kit",
  home_category_highlight: "Destaque de Categoria",
  campaign_banner: "Banner de Campanha",
  notice: "Aviso",
  delivery_info: "Informações de Entrega",
  checkout_notice: "Aviso do Checkout",
  final_cta: "CTA Final",
  faq_preview: "Preview FAQ",
  social_proof: "Prova Social",
  generic: "Genérico",
};

const statusConfig: Record<
  SiteContentStatus,
  { label: string; color: string; bg: string }
> = {
  draft: {
    label: "Rascunho",
    color: "text-yellow-800",
    bg: "bg-yellow-100",
  },
  published: {
    label: "Publicado",
    color: "text-green-800",
    bg: "bg-green-100",
  },
  inactive: {
    label: "Inativo",
    color: "text-red-800",
    bg: "bg-red-100",
  },
  archived: {
    label: "Arquivado",
    color: "text-zinc-800",
    bg: "bg-zinc-100",
  },
};

export function SiteContentList({
  items,
  onStatusChange,
  onArchive,
  isMutating,
}: SiteContentListProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <tr>
            <th className="px-6 py-4">Bloco</th>
            <th className="px-6 py-4">Tipo</th>
            <th className="px-6 py-4">Key</th>
            <th className="px-6 py-4">Prioridade</th>
            <th className="px-6 py-4">Exibição</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((item) => {
            const statusCfg = statusConfig[item.status];
            return (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {item.title || item.key}
                    </span>
                    {item.subtitle && (
                      <span className="text-xs text-zinc-500">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs">
                    {typeLabels[item.type] || item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {item.key}
                  </code>
                </td>
                <td className="px-6 py-4">{item.displayRules.priority}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.displayRules.showOnHome && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                        <Eye className="h-3 w-3" />
                        Home
                      </span>
                    )}
                    {item.displayRules.showOnCheckout && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
                        <Eye className="h-3 w-3" />
                        Checkout
                      </span>
                    )}
                    {item.displayRules.showOnCatalog && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        <Eye className="h-3 w-3" />
                        Catálogo
                      </span>
                    )}
                    {!item.displayRules.showOnHome &&
                      !item.displayRules.showOnCheckout &&
                      !item.displayRules.showOnCatalog && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                          <EyeOff className="h-3 w-3" />
                          Nenhum
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}
                  >
                    {item.status === "published" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {statusCfg.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {item.status === "published" ? (
                      <button
                        onClick={() => onStatusChange(item.id, "draft")}
                        disabled={isMutating}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-amber-600 hover:bg-amber-50 dark:border-zinc-800 dark:hover:bg-amber-900/20"
                        title="Despublicar"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onStatusChange(item.id, "published")}
                        disabled={isMutating}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-green-600 hover:bg-green-50 dark:border-zinc-800 dark:hover:bg-green-900/20"
                        title="Publicar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      href={`/dashboard/content/${item.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onArchive(item.id)}
                      disabled={isMutating}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-red-600 hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-900/20"
                      title="Arquivar"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
