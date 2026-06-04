"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { SiteContentForm } from "@/components/admin/content/SiteContentForm";
import { createSiteContent } from "@/lib/data/siteContent";
import { SiteContentInput } from "@/lib/validation/siteContent";

export default function NewSiteContentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SiteContentInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createSiteContent(data);
      router.push("/dashboard/content");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar bloco.";
      setError(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Bloco de Conteúdo"
        description="Crie blocos dinâmicos para Home, campanhas, avisos e checkout."
      />

      <SiteContentForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard/content")}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
