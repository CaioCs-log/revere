"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { AlertCircle, Info, Plus, Trash2 } from "lucide-react";
import { Product, ProductType } from "@/lib/firebase/products";
import { ProductVariant } from "@/lib/firebase/productVariants";
import { KitPreset, KitType, PricingMode } from "@/lib/firebase/kitPresets";
import { getProducts } from "@/lib/data/products";
import { getVariants } from "@/lib/data/productVariants";
import { slugify } from "@/lib/utils/slugify";
import {
  defaultKitDiscountTiers,
  KitPresetInput,
  kitPresetSchema,
} from "@/lib/validation/kitPreset";

interface KitFormProps {
  initialData?: KitPreset;
  onSubmit: (data: KitPresetInput) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

const defaultDiscountTiers = defaultKitDiscountTiers.map((tier) => ({
  ...tier,
}));

const productTypeLabels: Record<ProductType, string> = {
  frozen_meal: "Refeição congelada",
  frozen_snack: "Snack congelado",
  other: "Outros",
};

const pricingModeLabels: Record<PricingMode, string> = {
  fixed_price: "Preço fixo",
  sum_items: "Soma dos itens",
};

const isProductAvailable = (product: Product) =>
  product.status === "active" && product.isVisible;

const isVariantAvailable = (variant: ProductVariant) =>
  variant.status === "active" && variant.isVisible;

export function KitForm({
  initialData,
  onSubmit,
  isSubmitting,
  error: submitError,
}: KitFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState<KitPresetInput>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    status: initialData?.status || "draft",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    imageId: initialData?.imageId ?? null,
    imageAlt: initialData?.imageAlt ?? null,
    imageMode: initialData?.imageMode || "brand_placeholder",
    kitType: initialData?.kitType || "fixed",
    eligibleProductTypes: initialData?.eligibleProductTypes || ["frozen_meal"],
    allowRepeatedItems: initialData?.allowRepeatedItems ?? true,
    items: initialData?.items || [],
    minItems: initialData?.minItems ?? 7,
    maxItems: initialData?.maxItems ?? null,
    pricingMode: initialData?.pricingMode || "sum_items",
    fixedPriceCents: initialData?.fixedPriceCents ?? null,
    discountTiers: initialData?.discountTiers?.length
      ? initialData.discountTiers
      : defaultDiscountTiers,
    grantsFreeShipping: initialData?.grantsFreeShipping ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    sortOrder: initialData?.sortOrder ?? 0,
  });

  useEffect(() => {
    const load = async () => {
      const [allProducts, allVariants] = await Promise.all([
        getProducts(),
        getVariants(),
      ]);
      setProducts(allProducts);
      setVariants(allVariants);
    };
    load();
  }, []);

  const availableProducts = useMemo(
    () => products.filter(isProductAvailable),
    [products],
  );

  const availableVariants = useMemo(
    () => variants.filter(isVariantAvailable),
    [variants],
  );

  const variantsByProductId = useMemo(() => {
    const map = new Map<string, ProductVariant[]>();
    availableVariants.forEach((variant) => {
      const list = map.get(variant.productId) ?? [];
      list.push(variant);
      map.set(variant.productId, list);
    });
    return map;
  }, [availableVariants]);

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug === slugify(prev.name) ? slugify(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setFormData((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const handleKitTypeChange = (kitType: KitType) => {
    setFormData((prev) => ({
      ...prev,
      kitType,
      minItems: kitType === "customizable" ? 7 : prev.minItems,
      eligibleProductTypes:
        kitType === "customizable"
          ? ["frozen_meal"]
          : prev.eligibleProductTypes,
      discountTiers:
        kitType === "customizable" ? defaultDiscountTiers : prev.discountTiers,
      allowRepeatedItems:
        kitType === "customizable" ? true : prev.allowRepeatedItems,
    }));
  };

  const toggleEligibleType = (type: ProductType) => {
    setFormData((prev) => {
      const hasType = prev.eligibleProductTypes.includes(type);
      return {
        ...prev,
        eligibleProductTypes: hasType
          ? prev.eligibleProductTypes.filter((item) => item !== type)
          : [...prev.eligibleProductTypes, type],
      };
    });
  };

  const updateItem = (
    index: number,
    field: "productId" | "variantId" | "quantity",
    value: string | number,
  ) => {
    setFormData((prev) => {
      const items = [...prev.items];
      const current = items[index];

      if (field === "productId") {
        items[index] = {
          ...current,
          productId: value as string,
          variantId: "",
        };
      } else if (field === "variantId") {
        items[index] = {
          ...current,
          variantId: value as string,
        };
      } else {
        items[index] = {
          ...current,
          quantity: Number(value) || 0,
        };
      }

      return {
        ...prev,
        items,
      };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          variantId: "",
          quantity: 1,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const showBackendNotice = true;
  const showItemsRequiredHint =
    formData.kitType === "fixed" || formData.kitType === "suggested";
  const showCustomizableBlock = formData.kitType === "customizable";
  const availableProductWarning =
    availableProducts.length === 0 || availableVariants.length === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationErrors({});

    try {
      const payload: KitPresetInput = {
        ...formData,
        minItems: formData.kitType === "customizable" ? 7 : formData.minItems,
        eligibleProductTypes:
          formData.kitType === "customizable"
            ? ["frozen_meal"]
            : formData.eligibleProductTypes,
        discountTiers:
          formData.kitType === "customizable"
            ? defaultDiscountTiers
            : formData.discountTiers,
        fixedPriceCents:
          formData.pricingMode === "fixed_price"
            ? formData.fixedPriceCents
            : null,
      };

      const validated = kitPresetSchema.parse(payload);
      await onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0];
          if (field) {
            errors[field.toString()] = issue.message;
          }
        });
        setValidationErrors(errors);
        alert("Corrija os erros no formulário.");
      } else {
        console.error(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {submitError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {submitError}
        </div>
      )}

      {showBackendNotice && (
        <div className="flex items-start gap-3 rounded-md bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Validação final fica para o Backend</p>
            <p className="mt-1">
              O Admin configura o kit, mas preço final, desconto progressivo,
              frete e validações críticas de compra ainda serão confirmados no
              Backend em fase futura.
            </p>
          </div>
        </div>
      )}

      {availableProductWarning && (
        <div className="flex items-start gap-3 rounded-md bg-yellow-50 p-4 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Dependência dos módulos M3 e M4</p>
            <p className="mt-1">
              Para montar kits ativos, é preciso ter produtos e variantes ativos
              e visíveis já cadastrados. Cadastre esses itens antes de publicar
              o kit.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Kit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="Ex: Kit Semana Leve"
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
                  onChange={(event) => handleSlugChange(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
                {validationErrors.slug && (
                  <p className="text-xs text-red-500">
                    {validationErrors.slug}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Kit *</label>
                <select
                  value={formData.kitType}
                  onChange={(event) =>
                    handleKitTypeChange(event.target.value as KitType)
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="fixed">Fixed</option>
                  <option value="suggested">Suggested</option>
                  <option value="customizable">Customizable</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: event.target.value as KitPresetInput["status"],
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição curta</label>
              <textarea
                value={formData.shortDescription}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    shortDescription: event.target.value,
                  }))
                }
                rows={2}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="Resumo rápido para o card do kit"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Descrição completa {formData.status === "active" && "*"}
              </label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={5}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="Explique o objetivo comercial e a lógica do kit"
              />
              {validationErrors.description && (
                <p className="text-xs text-red-500">
                  {validationErrors.description}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Itens do Kit
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Use apenas produtos e variantes ativos e visíveis para kits
                  publicados.
                </p>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <Plus className="h-4 w-4" />
                Adicionar item
              </button>
            </div>

            {showItemsRequiredHint && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Kits {formData.kitType} exigem pelo menos um item vinculado.
              </p>
            )}

            {formData.items.length === 0 ? (
              <div className="rounded-md border border-dashed border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                Nenhum item adicionado ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => {
                  const productVariants =
                    variantsByProductId.get(item.productId) ?? [];

                  return (
                    <div
                      key={`${item.productId}-${index}`}
                      className="grid gap-4 rounded-lg border border-zinc-200 p-4 md:grid-cols-[1fr_1fr_120px_auto] dark:border-zinc-800"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Produto</label>
                        <select
                          value={item.productId}
                          onChange={(event) =>
                            updateItem(index, "productId", event.target.value)
                          }
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <option value="">Selecione um produto</option>
                          {availableProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Variante</label>
                        <select
                          value={item.variantId}
                          onChange={(event) =>
                            updateItem(index, "variantId", event.target.value)
                          }
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <option value="">Selecione uma variante</option>
                          {productVariants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.name} · {variant.portionLabel} · R${" "}
                              {(variant.priceCents / 100).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Qtd.</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, "quantity", event.target.value)
                          }
                          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-red-600 hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {validationErrors.items && (
              <p className="text-xs text-red-500">{validationErrors.items}</p>
            )}
          </section>

          <section className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Regras comerciais
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Defina elegibilidade, composição e modelo de preço do kit.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço do kit</label>
                <select
                  value={formData.pricingMode}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricingMode: event.target.value as PricingMode,
                      fixedPriceCents:
                        event.target.value === "fixed_price"
                          ? prev.fixedPriceCents
                          : null,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {Object.entries(pricingModeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preço fixo (R$)</label>
                <input
                  type="text"
                  value={
                    formData.fixedPriceCents !== null
                      ? (formData.fixedPriceCents / 100).toFixed(2)
                      : ""
                  }
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/[^0-9,\.]/g, "")
                      .replace(",", ".");
                    setFormData((prev) => ({
                      ...prev,
                      fixedPriceCents: event.target.value
                        ? Math.round((parseFloat(value) || 0) * 100)
                        : null,
                    }));
                  }}
                  disabled={formData.pricingMode !== "fixed_price"}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:disabled:bg-zinc-800"
                />
                {validationErrors.fixedPriceCents && (
                  <p className="text-xs text-red-500">
                    {validationErrors.fixedPriceCents}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mínimo de itens</label>
                <input
                  type="number"
                  min={1}
                  value={formData.minItems}
                  disabled={showCustomizableBlock}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      minItems: Number(event.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:disabled:bg-zinc-800"
                />
                {showCustomizableBlock && (
                  <p className="text-xs text-zinc-500">
                    Fixo em 7 no MVP para kits customizáveis.
                  </p>
                )}
                {validationErrors.minItems && (
                  <p className="text-xs text-red-500">
                    {validationErrors.minItems}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Máximo de itens</label>
                <input
                  type="number"
                  min={1}
                  value={formData.maxItems ?? ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxItems: event.target.value
                        ? Number(event.target.value)
                        : null,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">
                Tipos elegíveis para composição
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(productTypeLabels) as ProductType[]).map(
                  (type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={formData.eligibleProductTypes.includes(type)}
                        disabled={
                          showCustomizableBlock && type !== "frozen_meal"
                        }
                        onChange={() => toggleEligibleType(type)}
                      />
                      {productTypeLabels[type]}
                    </label>
                  ),
                )}
              </div>
              {validationErrors.eligibleProductTypes && (
                <p className="text-xs text-red-500">
                  {validationErrors.eligibleProductTypes}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={formData.allowRepeatedItems}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowRepeatedItems: event.target.checked,
                    }))
                  }
                />
                Permitir repetição de itens
              </label>

              <label className="flex items-center gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={formData.grantsFreeShipping}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      grantsFreeShipping: event.target.checked,
                    }))
                  }
                />
                Conceder frete grátis promocional
              </label>
            </div>

            {showCustomizableBlock && (
              <div className="space-y-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-900/20">
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                    Faixas de desconto progressivo do MVP
                  </h3>
                  <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                    Essas faixas são fixas para o M6 e devem seguir exatamente
                    5% / 8% / 10%.
                  </p>
                </div>
                <div className="space-y-2">
                  {formData.discountTiers.map((tier) => (
                    <div
                      key={`${tier.minItems}-${tier.discountPercent}`}
                      className="grid gap-3 rounded-md border border-indigo-200 bg-white p-3 text-sm sm:grid-cols-3 dark:border-indigo-900/50 dark:bg-zinc-950"
                    >
                      <input
                        type="number"
                        value={tier.minItems}
                        readOnly
                        className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={tier.maxItems ?? "15+"}
                        readOnly
                        className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        value={`${tier.discountPercent}%`}
                        readOnly
                        className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                  ))}
                </div>
                {validationErrors.discountTiers && (
                  <p className="text-xs text-red-500">
                    {validationErrors.discountTiers}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Destaque e ordenação
            </h2>

            <label className="flex items-center gap-3 rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    isFeatured: event.target.checked,
                  }))
                }
              />
              Destacar este kit
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    sortOrder: Number(event.target.value) || 0,
                  }))
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Mídia (placeholder)
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">imageId</label>
              <input
                type="text"
                value={formData.imageId ?? ""}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageId: event.target.value || null,
                  }))
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="Ex: kit-semana-leve-hero"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">imageAlt</label>
              <input
                type="text"
                value={formData.imageAlt ?? ""}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageAlt: event.target.value || null,
                  }))
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">imageMode</label>
              <select
                value={formData.imageMode}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageMode: event.target
                      .value as KitPresetInput["imageMode"],
                  }))
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="brand_placeholder">Brand placeholder</option>
                <option value="editorial">Editorial</option>
                <option value="illustration">Illustration</option>
                <option value="real_photo">Real photo</option>
              </select>
            </div>
          </section>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-indigo-600 px-4 py-2 text-white"
        >
          {isSubmitting ? "Salvando..." : "Salvar Kit"}
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
}
