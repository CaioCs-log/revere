"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import VariantForm from "@/components/admin/variants/VariantForm";
import { createVariant } from "@/lib/data/productVariants";
import { useState } from "react";
import { ProductVariantInput } from "@/lib/validation/productVariant";
import { useRouter } from "next/navigation";

export default function NewVariantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProductVariantInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createVariant(data);
      router.push("/dashboard/variants");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao criar variante.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Variante"
        description="Adicione uma variante comercial para um produto."
      />
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <VariantForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
