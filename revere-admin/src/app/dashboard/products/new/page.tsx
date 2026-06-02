"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { createProduct } from "@/lib/data/products";
import { ProductInput } from "@/lib/validation/product";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ProductInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createProduct(data);
      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar produto.";
      setError(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Produto"
        description="Cadastre um novo prato base no catálogo."
      />

      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
