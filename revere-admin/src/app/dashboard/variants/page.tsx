"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorState } from "@/components/admin/ErrorState";
import { VariantList } from "@/components/admin/variants/VariantList";
import Link from "next/link";
import { getVariants, archiveVariant } from "@/lib/data/productVariants";
import { useCallback, useEffect, useState } from "react";
import { ProductVariant } from "@/lib/firebase/productVariants";

export default function VariantsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getVariants();
      setVariants(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar variantes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetch();
    };
    load();
  }, [fetch]);

  const handleArchive = async (id: string) => {
    if (!confirm("Arquivar variante?")) return;
    try {
      setIsMutating(true);
      await archiveVariant(id);
      await fetch();
    } catch (err) {
      console.error(err);
      alert("Erro ao arquivar variante.");
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Variantes"
        description="Gerencie as variantes de gramatura e preço."
        action={{
          label: "Adicionar Variante",
          href: "/dashboard/variants/new",
        }}
      />

      {variants.length === 0 ? (
        <EmptyState
          title="Nenhuma variante encontrada"
          description="A lista de variantes está vazia."
          action={
            <Link
              href="/dashboard/variants/new"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Adicionar Variante
            </Link>
          }
        />
      ) : (
        <VariantList
          variants={variants}
          onArchive={handleArchive}
          isMutating={isMutating}
        />
      )}
    </div>
  );
}
