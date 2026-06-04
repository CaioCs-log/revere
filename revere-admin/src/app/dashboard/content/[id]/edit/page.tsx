"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { SiteContentForm } from "@/components/admin/content/SiteContentForm";
import { getSiteContentById, updateSiteContent } from "@/lib/data/siteContent";
import { SiteContent } from "@/lib/firebase/siteContent";
import { SiteContentInput } from "@/lib/validation/siteContent";

export default function EditSiteContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [item, setItem] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSiteContentById(id);
      if (!data) {
        setError("Bloco não encontrado.");
        return;
      }
      setItem(data);
    } catch (err) {
      setError("Erro ao carregar bloco.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchItem();
    };
    load();
  }, [fetchItem]);

  const handleSubmit = async (data: SiteContentInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updateSiteContent(id, data);
      router.push("/dashboard/content");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar bloco.";
      setError(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !item)
    return (
      <ErrorState
        message={error || "Bloco não encontrado"}
        onRetry={fetchItem}
      />
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${item.title || item.key}`}
        description="Atualize o conteúdo, imagem, CTA e regras de exibição."
      />

      <SiteContentForm
        initialData={item}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/content")}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
