"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorState } from "@/components/admin/ErrorState";
import { ProductList } from "@/components/admin/products/ProductList";
import { getProducts, archiveProduct } from "@/lib/data/products";
import { Product } from "@/lib/firebase/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar produtos.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
    };
    load();
  }, [fetchProducts]);

  const handleArchive = async (id: string) => {
    if (!confirm("Tem certeza que deseja arquivar este produto?")) return;

    try {
      setIsMutating(true);
      await archiveProduct(id);
      await fetchProducts();
    } catch (err) {
      alert("Erro ao arquivar produto.");
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchProducts} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie o cadastro principal dos pratos e itens da Revere."
        action={{ label: "Adicionar Produto", href: "/dashboard/products/new" }}
      />

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Comece cadastrando seu primeiro produto base."
          action={
            <Link
              href="/dashboard/products/new"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cadastrar Produto
            </Link>
          }
        />
      ) : (
        <ProductList
          products={products}
          onArchive={handleArchive}
          isMutating={isMutating}
        />
      )}
    </div>
  );
}
