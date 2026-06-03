"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { KitList } from "@/components/admin/kits/KitList";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { archiveKitPreset, getKitPresets } from "@/lib/data/kitPresets";
import { KitPreset } from "@/lib/firebase/kitPresets";

export default function KitsPage() {
  const [kits, setKits] = useState<KitPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKits = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getKitPresets();
      setKits(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar kits.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchKits();
    };
    load();
  }, [fetchKits]);

  const handleArchive = async (id: string) => {
    if (!confirm("Tem certeza que deseja arquivar este kit?")) return;

    try {
      setIsMutating(true);
      await archiveKitPreset(id);
      await fetchKits();
    } catch (err) {
      alert("Erro ao arquivar kit.");
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchKits} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kits"
        description="Gerencie kits prontos, sugeridos e customizáveis da Revere."
        action={{ label: "Adicionar Kit", href: "/dashboard/kits/new" }}
      />

      {kits.length === 0 ? (
        <EmptyState
          title="Nenhum kit encontrado"
          description="Comece cadastrando o primeiro kit comercial do catálogo."
          action={
            <Link
              href="/dashboard/kits/new"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cadastrar Kit
            </Link>
          }
        />
      ) : (
        <KitList
          kits={kits}
          onArchive={handleArchive}
          isMutating={isMutating}
        />
      )}
    </div>
  );
}
