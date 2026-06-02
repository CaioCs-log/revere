"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { NeighborhoodForm } from "@/components/admin/neighborhoods/NeighborhoodForm";
import { createNeighborhood } from "@/lib/data/neighborhoods";
import { useState } from "react";
import { neighborhoodSchema } from "@/lib/validation/neighborhood";
import type { Neighborhood } from "@/lib/validation/neighborhood";
import { useRouter } from "next/navigation";
import type { z } from "zod";

type NeighborhoodInput = z.infer<typeof neighborhoodSchema>;

export default function NewNeighborhoodPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: NeighborhoodInput) => {
    try {
      setError(null);
      // Zod parse to ensure shape
      const parsed = neighborhoodSchema.parse(data);
      await createNeighborhood(
        parsed as unknown as Omit<
          Neighborhood,
          "id" | "createdAt" | "updatedAt"
        >,
      );
      router.push("/dashboard/neighborhoods");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar bairro.");
    } finally {
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Bairro"
        description="Adicione um bairro atendido."
      />
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <NeighborhoodForm onSubmit={handleSubmit} />
    </div>
  );
}
