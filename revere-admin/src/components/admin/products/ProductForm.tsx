"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Product,
  ProductStatus,
  ImageMode,
  ProductType,
} from "@/lib/firebase/products";
import {
  ProductInput,
  productSchema,
  activeProductSchema,
} from "@/lib/validation/product";
import { slugify } from "@/lib/utils/slugify";
import { getCategories, Category } from "@/lib/data/categories";
import { getTags, Tag } from "@/lib/data/tags";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductInput) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  error: submitError,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductInput>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    status: initialData?.status || "draft",
    isVisible: initialData?.isVisible ?? false,
    productType: initialData?.productType || "frozen_meal",
    categoryIds: initialData?.categoryIds || [],
    tagIds: initialData?.tagIds || [],
    imageIds: initialData?.imageIds || [],
    mainImageId: initialData?.mainImageId || null,
    mainImageAlt: initialData?.mainImageAlt || null,
    imageMode: initialData?.imageMode || "brand_placeholder",
    ingredients: initialData?.ingredients || [],
    allergens: initialData?.allergens || [],
    nutritionalHighlights: initialData?.nutritionalHighlights || [],
    storageInstructions: initialData?.storageInstructions || "",
    consumptionInstructions: initialData?.consumptionInstructions || "",
    isFeatured: initialData?.isFeatured ?? false,
    isNew: initialData?.isNew ?? false,
    sortOrder: initialData?.sortOrder || 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<
    "general" | "editorial" | "nutritional" | "media"
  >("general");

  useEffect(() => {
    const loadData = async () => {
      const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
      setCategories(cats);
      setTags(tgs);
    };
    loadData();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === slugify(prev.name) ? slugify(name) : prev.slug,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const toggleCategoryId = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((cid) => cid !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const toggleTagId = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((tid) => tid !== id)
        : [...prev.tagIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      // Validate based on status
      const schema =
        formData.status === "active" ? activeProductSchema : productSchema;
      const validatedData = schema.parse(formData);
      await onSubmit(validatedData as ProductInput);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) {
            errors[e.path[0].toString()] = e.message;
          }
        });
        setValidationErrors(errors);
        // Alert user if there are errors
        alert("Por favor, corrija os erros no formulário.");
      } else {
        console.error(err);
      }
    }
  };

  const isStatusActive = formData.status === "active";
  const showVariantAlert = isStatusActive && formData.isVisible;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {submitError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {submitError}
        </div>
      )}

      {showVariantAlert && (
        <div className="flex items-start gap-3 rounded-md bg-yellow-50 p-4 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Aviso de disponibilidade</p>
            <p className="mt-1">
              Este produto está marcado como Ativo e Visível, mas ainda não
              possui variante cadastrada (M4). Ele não estará apto para venda
              pública até que uma variante seja criada no próximo módulo.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
        {(
          [
            { id: "general", label: "Geral" },
            { id: "editorial", label: "Editorial" },
            { id: "nutritional", label: "Nutricional" },
            { id: "media", label: "Mídia (Placeholder)" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {activeTab === "general" && (
            <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder="Ex: Frango Cremoso"
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  {validationErrors.slug && (
                    <p className="text-xs text-red-500">
                      {validationErrors.slug}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Produto</label>
                <select
                  value={formData.productType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productType: e.target.value as ProductType,
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="frozen_meal">Refeição Congelada</option>
                  <option value="frozen_snack">Snack Congelado</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">
                  Categorias {isStatusActive && "*"}
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 rounded-md border border-zinc-200 p-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(cat.id)}
                        onChange={() => toggleCategoryId(cat.id)}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
                {validationErrors.categoryIds && (
                  <p className="text-xs text-red-500">
                    {validationErrors.categoryIds}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Tags</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 rounded-md border border-zinc-200 p-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tagIds.includes(tag.id)}
                        onChange={() => toggleTagId(tag.id)}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "editorial" && (
            <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Resumo (Chamada) {isStatusActive && "*"}
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="Ex: Delicioso frango com molho artesanal."
                />
                {validationErrors.shortDescription && (
                  <p className="text-xs text-red-500">
                    {validationErrors.shortDescription}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Descrição Completa {isStatusActive && "*"}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
                {validationErrors.description && (
                  <p className="text-xs text-red-500">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Instruções de Armazenamento
                  </label>
                  <textarea
                    value={formData.storageInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storageInstructions: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder="Ex: Manter congelado a -18°C."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Instruções de Consumo
                  </label>
                  <textarea
                    value={formData.consumptionInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consumptionInstructions: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder="Ex: Aquecer por 5 min no micro-ondas."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "nutritional" && (
            <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="rounded-md bg-blue-50 p-4 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <p>
                    Estes campos são informativos e serão validados tecnicamente
                    pela nutricionista antes da publicação final.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ingredientes (Separados por vírgula)
                </label>
                <textarea
                  value={formData.ingredients.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ingredients: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Alergênicos (Separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.allergens.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allergens: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Destaques Nutricionais (Separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.nutritionalHighlights.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nutritionalHighlights: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="Ex: Baixo Sódio, Rico em Fibras"
                />
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="rounded-md border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500">
                  Módulo de Upload (Firebase Storage) desabilitado nesta fase.
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Usando referências lógicas para placeholders.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Modo da Imagem {isStatusActive && "*"}
                  </label>
                  <select
                    value={formData.imageMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        imageMode: e.target.value as ImageMode,
                      })
                    }
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="brand_placeholder">
                      Placeholder de Marca
                    </option>
                    <option value="real_photo">Foto Real (Produção)</option>
                    <option value="editorial">Editorial / Conceitual</option>
                    <option value="illustration">Ilustração</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ID da Imagem Principal (Lógico)
                  </label>
                  <input
                    type="text"
                    value={formData.mainImageId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mainImageId: e.target.value || null,
                      })
                    }
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder="Ex: frango-cremoso-v1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
              Publicação
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ProductStatus,
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="draft">Rascunho</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) =>
                    setFormData({ ...formData, isVisible: e.target.checked })
                  }
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="isVisible"
                  className="text-sm leading-none font-medium"
                >
                  Visível no Storefront
                </label>
              </div>

              <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium">
                    Destaque na Home
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isNew"
                  checked={formData.isNew}
                  onChange={(e) =>
                    setFormData({ ...formData, isNew: e.target.checked })
                  }
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isNew" className="text-sm font-medium">
                  Selo de Novidade
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordem de Exibição</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Salvar Produto
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
