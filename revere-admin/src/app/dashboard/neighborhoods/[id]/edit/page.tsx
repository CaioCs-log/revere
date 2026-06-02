"use client";

import React from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { NeighborhoodForm } from "@/components/admin/neighborhoods/NeighborhoodForm";
import {
  getNeighborhoodById,
  updateNeighborhood,
} from "@/lib/data/neighborhoods";
import { useRouter, useParams } from "next/navigation";
import type { z } from "zod";
import { neighborhoodSchema } from "@/lib/validation/neighborhood";
type NeighborhoodInput = z.infer<typeof neighborhoodSchema>;
import type { Neighborhood } from "@/lib/validation/neighborhood";

export default function EditNeighborhoodPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [initial, setInitial] = React.useState<Partial<Neighborhood> | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await getNeighborhoodById(id);
        if (mounted) setInitial(data ?? null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (data: NeighborhoodInput) => {
    try {
      setError(null);
      await updateNeighborhood(id, data as unknown as Partial<Neighborhood>);
      router.push("/dashboard/neighborhoods");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar bairro.",
      );
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (!initial) return <div>Bairro não encontrado.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Bairro"
        description="Atualize os dados do bairro."
      />
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <NeighborhoodForm initialData={initial} onSubmit={handleSubmit} />
    </div>
  );
}
