"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { SiteContentList } from "@/components/admin/content/SiteContentList";
import {
  getSiteContents,
  updateSiteContentStatus,
  archiveSiteContent,
} from "@/lib/data/siteContent";
import { SiteContent, SiteContentStatus } from "@/lib/firebase/siteContent";

export default function SiteContentPage() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSiteContents();
      setItems(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar blocos de conteúdo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchItems();
    };
    load();
  }, [fetchItems]);

  const handleStatusChange = async (id: string, status: SiteContentStatus) => {
    try {
      setIsMutating(true);
      await updateSiteContentStatus(id, status);
      await fetchItems();
    } catch (err) {
      alert("Erro ao alterar status.");
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Tem certeza que deseja arquivar este bloco?")) return;

    try {
      setIsMutating(true);
      await archiveSiteContent(id);
      await fetchItems();
    } catch (err) {
      alert("Erro ao arquivar bloco.");
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchItems} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conteúdo Dinâmico"
        description="Gerencie banners, seções, avisos e blocos dinâmicos da Home."
        action={{ label: "Adicionar Bloco", href: "/dashboard/content/new" }}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum bloco encontrado"
          description="Crie o primeiro bloco de conteúdo dinâmico para a Home."
          action={
            <Link
              href="/dashboard/content/new"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Criar Bloco
            </Link>
          }
        />
      ) : (
        <SiteContentList
          items={items}
          onStatusChange={handleStatusChange}
          onArchive={handleArchive}
          isMutating={isMutating}
        />
      )}
    </div>
  );
}
