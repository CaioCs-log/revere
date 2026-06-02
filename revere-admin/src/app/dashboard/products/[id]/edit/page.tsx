"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorState } from "@/components/admin/ErrorState";
import { getProductById, updateProduct } from "@/lib/data/products";
import { ProductInput } from "@/lib/validation/product";
import { Product } from "@/lib/firebase/products";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProductById(id);
      if (!data) {
        setError("Produto não encontrado.");
        return;
      }
      setProduct(data);
    } catch (err) {
      setError("Erro ao carregar produto.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchProduct();
    };
    load();
  }, [fetchProduct]);

  const handleSubmit = async (data: ProductInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updateProduct(id, data);
      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar produto.";
      setError(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !product)
    return (
      <ErrorState
        message={error || "Produto não encontrado"}
        onRetry={fetchProduct}
      />
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar: ${product.name}`}
        description="Atualize as informações do produto base."
      />

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
