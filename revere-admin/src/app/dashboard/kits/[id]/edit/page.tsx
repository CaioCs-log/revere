"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ErrorState } from "@/components/admin/ErrorState";
import { KitForm } from "@/components/admin/kits/KitForm";
import { LoadingState } from "@/components/admin/LoadingState";
import { getKitPresetById, updateKitPreset } from "@/lib/data/kitPresets";
import { KitPreset } from "@/lib/firebase/kitPresets";
import { KitPresetInput } from "@/lib/validation/kitPreset";

export default function EditKitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [kit, setKit] = useState<KitPreset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKit = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getKitPresetById(id);
      if (!data) {
        setError("Kit não encontrado.");
        return;
      }
      setKit(data);
    } catch (err) {
      setError("Erro ao carregar kit.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchKit();
    };
    load();
  }, [fetchKit]);

  const handleSubmit = async (data: KitPresetInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updateKitPreset(id, data);
      router.push("/dashboard/kits");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar kit.";
      setError(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !kit)
    return (
      <ErrorState message={error || "Kit não encontrado"} onRetry={fetchKit} />
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${kit.name}`}
        description="Atualize as regras comerciais e a composição do kit."
      />

      <KitForm
        initialData={kit}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
