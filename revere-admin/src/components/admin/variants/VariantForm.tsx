"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ProductVariant } from "@/lib/firebase/productVariants";
import {
  ProductVariantInput,
  productVariantSchema,
} from "@/lib/validation/productVariant";
import { getProducts } from "@/lib/data/products";
import { Product } from "@/lib/firebase/products";

interface VariantFormProps {
  initialData?: ProductVariant;
  onSubmit: (data: ProductVariantInput) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export const VariantForm: React.FC<VariantFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  error: submitError,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductVariantInput>({
    productId: initialData?.productId || "",
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    status: initialData?.status || "draft",
    portionLabel: initialData?.portionLabel || "",
    weightGrams: initialData?.weightGrams || 0,
    priceCents: initialData?.priceCents || 0,
    compareAtPriceCents: initialData?.compareAtPriceCents ?? null,
    isVisible: initialData?.isVisible ?? false,
    minQuantity: initialData?.minQuantity || 1,
    maxQuantity: initialData?.maxQuantity ?? null,
    isDefault: initialData?.isDefault || false,
    sortOrder: initialData?.sortOrder || 0,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const load = async () => {
      const p = await getProducts();
      setProducts(p);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    try {
      const validated = productVariantSchema.parse(formData);
      await onSubmit(validated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errs: Record<string, string> = {};
        err.issues.forEach((i) => {
          if (i.path[0]) errs[i.path[0].toString()] = i.message;
        });
        setValidationErrors(errs);
        alert("Corrija os erros no formulário.");
      } else {
        console.error(err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Produto *</label>
        <select
          value={formData.productId}
          onChange={(e) =>
            setFormData({ ...formData, productId: e.target.value })
          }
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Selecione um produto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {validationErrors.productId && (
          <p className="text-xs text-red-500">{validationErrors.productId}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Nome *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-md border px-3 py-2"
        />
        {validationErrors.name && (
          <p className="text-xs text-red-500">{validationErrors.name}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">SKU *</label>
        <input
          type="text"
          value={formData.sku}
          onChange={(e) =>
            setFormData({
              ...formData,
              sku: e.target.value.toUpperCase().trim(),
            })
          }
          className="w-full rounded-md border px-3 py-2"
        />
        {validationErrors.sku && (
          <p className="text-xs text-red-500">{validationErrors.sku}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Porção *</label>
          <input
            type="text"
            value={formData.portionLabel}
            onChange={(e) =>
              setFormData({ ...formData, portionLabel: e.target.value })
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Peso (g) *</label>
          <input
            type="number"
            value={formData.weightGrams}
            onChange={(e) =>
              setFormData({
                ...formData,
                weightGrams: parseInt(e.target.value) || 0,
              })
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Preço (R$)</label>
          <input
            type="text"
            value={(formData.priceCents / 100).toFixed(2)}
            onChange={(e) => {
              const val = e.target.value
                .replace(/[^0-9,\.]/g, "")
                .replace(",", ".");
              const cents = Math.round((parseFloat(val) || 0) * 100);
              setFormData({ ...formData, priceCents: cents });
            }}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Preço comparativo (R$)</label>
          <input
            type="text"
            value={
              formData.compareAtPriceCents
                ? (formData.compareAtPriceCents / 100).toFixed(2)
                : ""
            }
            onChange={(e) => {
              const val = e.target.value
                .replace(/[^0-9,\.]/g, "")
                .replace(",", ".");
              const cents = e.target.value
                ? Math.round((parseFloat(val) || 0) * 100)
                : null;
              setFormData({ ...formData, compareAtPriceCents: cents });
            }}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isVisible}
          onChange={(e) =>
            setFormData({ ...formData, isVisible: e.target.checked })
          }
        />
        <label className="text-sm">Visível no Storefront</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) =>
            setFormData({ ...formData, isDefault: e.target.checked })
          }
        />
        <label className="text-sm">Variante padrão</label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-indigo-600 px-4 py-2 text-white"
        >
          {isSubmitting ? "Salvando..." : "Salvar Variante"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default VariantForm;
