"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import VariantForm from "@/components/admin/variants/VariantForm";
import { getVariantById, updateVariant } from "@/lib/data/productVariants";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorState } from "@/components/admin/ErrorState";
import { ProductVariant } from "@/lib/firebase/productVariants";
import { ProductVariantInput } from "@/lib/validation/productVariant";

export default function EditVariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const v = await getVariantById(id);
      if (!v) {
        setError("Variante não encontrada");
        return;
      }
      setVariant(v);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar variante");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetch();
    };
    load();
  }, [fetch]);

  const handleSubmit = async (data: ProductVariantInput) => {
    try {
      setIsSubmitting(true);
      await updateVariant(id, data);
      router.push("/dashboard/variants");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !variant)
    return (
      <ErrorState
        message={error || "Variante não encontrada"}
        onRetry={fetch}
      />
    );

  return (
    <div className="space-y-6">
      <VariantForm
        initialData={variant}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
